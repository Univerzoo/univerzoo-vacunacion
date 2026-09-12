"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClinicSettings, getReminderSettings } from "@/lib/settings";
import { testWhatsAppConnection } from "@/lib/whatsapp";
import {
  clinicSettingsSchema,
  reminderSettingsSchema,
  zodErrorToFieldErrors,
  type FormState,
} from "@/lib/validation";

export async function updateClinicSettingsAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = clinicSettingsSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    address: String(formData.get("address") ?? ""),
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) return { fieldErrors: zodErrorToFieldErrors(parsed.error) };

  const current = await getClinicSettings();
  await db.clinicSettings.update({
    where: { id: current.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      whatsapp: parsed.data.whatsapp || null,
      address: parsed.data.address || null,
      email: parsed.data.email || null,
    },
  });

  await logAudit({ userId: session.sub, action: "UPDATE", entity: "ClinicSettings", entityId: current.id });
  revalidatePath("/settings");
  return {};
}

export async function updateReminderSettingsAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = reminderSettingsSchema.safeParse({
    daysBefore1: formData.get("daysBefore1"),
    daysBefore2: formData.get("daysBefore2"),
    daysBefore3: formData.get("daysBefore3"),
    dayOf: formData.get("dayOf"),
    daysAfter: formData.get("daysAfter"),
    retryOnError: formData.get("retryOnError") === "on",
  });
  if (!parsed.success) return { fieldErrors: zodErrorToFieldErrors(parsed.error) };

  const current = await getReminderSettings();
  await db.reminderSettings.update({ where: { id: current.id }, data: parsed.data });

  await logAudit({ userId: session.sub, action: "UPDATE", entity: "ReminderSettings", entityId: current.id });
  revalidatePath("/settings");
  return {};
}

export async function testWhatsappConnectionAction() {
  await requireRole(["ADMIN"]);
  return testWhatsAppConnection();
}
