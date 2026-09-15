import { db } from "@/lib/db";
import { daysUntil } from "@/lib/status";
import { renderTemplate, buildWhatsAppTemplateParams } from "@/lib/template";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { getClinicSettings, getReminderSettings } from "@/lib/settings";
import type { EtapaRecordatorio } from "@/generated/prisma/enums";
import { format } from "date-fns";

export type ReminderRunSummary = {
  checked: number;
  created: number;
  sent: number;
  failed: number;
};

/**
 * Revisa todas las vacunaciones activas y genera/envía los recordatorios que
 * correspondan según la fecha manual de próxima vacunación. Idempotente por
 * (vacunación, etapa): una etapa nunca se envía dos veces para la misma
 * vacunación gracias a la restricción única en `messages`.
 */
export async function runReminderEngine(
  today: Date = new Date()
): Promise<ReminderRunSummary> {
  const [reminderSettings, clinicSettings, templates] = await Promise.all([
    getReminderSettings(),
    getClinicSettings(),
    db.messageTemplate.findMany({ where: { active: true } }),
  ]);

  const templateByStage = new Map(templates.map((t) => [t.stage, t]));

  const vaccinations = await db.vaccination.findMany({
    where: { cancelled: false },
    include: {
      pet: { include: { owner: true } },
      vaccineType: true,
    },
  });

  const summary: ReminderRunSummary = {
    checked: vaccinations.length,
    created: 0,
    sent: 0,
    failed: 0,
  };

  for (const vaccination of vaccinations) {
    const remaining = daysUntil(vaccination.nextDate, today);
    const stage = matchStage(remaining, reminderSettings);
    if (!stage) continue;

    const existing = await db.message.findUnique({
      where: {
        vaccinationId_stage: { vaccinationId: vaccination.id, stage },
      },
    });
    if (existing) continue;

    const template = templateByStage.get(stage);
    const owner = vaccination.pet.owner;

    const renderedContent = template
      ? renderTemplate(template.content, {
          propietario: `${owner.firstName} ${owner.lastName}`,
          mascota: vaccination.pet.name,
          vacuna: vaccination.vaccineType.name,
          fecha_vacunacion: format(vaccination.nextDate, "dd/MM/yyyy"),
          clinica: clinicSettings.name,
          telefono_clinica: clinicSettings.phone ?? "",
        })
      : null;

    const message = await db.message.create({
      data: {
        ownerId: owner.id,
        petId: vaccination.petId,
        vaccinationId: vaccination.id,
        stage,
        templateId: template?.id,
        renderedContent,
        whatsappNumber: owner.whatsapp,
        status: "PENDIENTE",
      },
    });
    summary.created += 1;

    if (!template) {
      await db.message.update({
        where: { id: message.id },
        data: { status: "ERROR", error: "No hay plantilla activa para esta etapa." },
      });
      summary.failed += 1;
      continue;
    }

    const result = await sendWhatsAppTemplate(
      owner.whatsapp,
      template.whatsappTemplateName,
      buildWhatsAppTemplateParams({
        ownerName: `${owner.firstName} ${owner.lastName}`,
        petName: vaccination.pet.name,
        vaccineName: vaccination.vaccineType.name,
        nextDate: format(vaccination.nextDate, "dd/MM/yyyy"),
        clinicName: clinicSettings.name,
      })
    );

    if (result.ok) {
      await db.message.update({
        where: { id: message.id },
        data: { status: "ENVIADO", sentAt: new Date(), externalId: result.externalId },
      });
      summary.sent += 1;
    } else {
      await db.message.update({
        where: { id: message.id },
        data: { status: "ERROR", error: result.error },
      });
      summary.failed += 1;
    }
  }

  return summary;
}

function matchStage(
  remaining: number,
  settings: { daysBefore1: number; daysBefore2: number; daysBefore3: number; dayOf: number; daysAfter: number }
): EtapaRecordatorio | null {
  if (remaining === settings.daysBefore1) return "DIAS_30";
  if (remaining === settings.daysBefore2) return "DIAS_7";
  if (remaining === settings.daysBefore3) return "DIA_1";
  if (remaining === settings.dayOf) return "DIA_0";
  if (remaining === -settings.daysAfter) return "VENCIDA_7";
  return null;
}
