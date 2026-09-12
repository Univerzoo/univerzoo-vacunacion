import { db } from "@/lib/db";

export async function getClinicSettings() {
  const existing = await db.clinicSettings.findFirst();
  if (existing) return existing;
  return db.clinicSettings.create({
    data: {
      name: process.env.CLINIC_NAME || "UNIVERZOO Clínica Veterinaria",
      phone: process.env.CLINIC_PHONE || null,
      whatsapp: process.env.CLINIC_WHATSAPP || null,
      logoUrl: "/logo.jpeg",
    },
  });
}

export async function getReminderSettings() {
  const existing = await db.reminderSettings.findFirst();
  if (existing) return existing;
  return db.reminderSettings.create({ data: {} });
}
