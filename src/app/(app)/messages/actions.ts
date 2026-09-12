"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { getReminderSettings } from "@/lib/settings";

export async function retryMessageAction(id: string) {
  const session = await requireUser();
  const settings = await getReminderSettings();
  if (!settings.retryOnError) return;

  const message = await db.message.findUnique({
    where: { id },
    include: { pet: true, owner: true, vaccination: { include: { vaccineType: true } }, template: true },
  });
  if (!message || message.status !== "ERROR" || !message.template) return;

  const result = await sendWhatsAppTemplate(message.whatsappNumber, message.template.whatsappTemplateName, [
    `${message.owner.firstName} ${message.owner.lastName}`,
    message.pet.name,
    message.vaccination.vaccineType.name,
  ]);

  await db.message.update({
    where: { id },
    data: result.ok
      ? { status: "ENVIADO", sentAt: new Date(), externalId: result.externalId, error: null }
      : { status: "ERROR", error: result.error },
  });

  await logAudit({ userId: session.sub, action: "RETRY_SEND", entity: "Message", entityId: id });
  revalidatePath("/messages");
}
