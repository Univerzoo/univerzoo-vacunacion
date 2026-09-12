import { z } from "zod";

export const whatsappSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, "Formato inválido. Usá el formato internacional, ej: +595981123456");

export const ownerSchema = z.object({
  firstName: z.string().trim().min(1, "Requerido"),
  lastName: z.string().trim().min(1, "Requerido"),
  whatsapp: whatsappSchema,
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const petSchema = z.object({
  ownerId: z.string().min(1, "Requerido"),
  name: z.string().trim().min(1, "Requerido"),
  speciesId: z.string().optional().or(z.literal("")),
  breed: z.string().trim().optional().or(z.literal("")),
  sex: z.enum(["MACHO", "HEMBRA"]).optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  color: z.string().trim().optional().or(z.literal("")),
  weight: z.string().optional().or(z.literal("")),
  fileNumber: z.string().trim().optional().or(z.literal("")),
  microchip: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const vaccineTypeSchema = z.object({
  name: z.string().trim().min(1, "Requerido"),
  speciesId: z.string().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
});

export const vaccinationSchema = z.object({
  petId: z.string().min(1, "Requerido"),
  vaccineTypeId: z.string().min(1, "Requerido"),
  commercialName: z.string().trim().optional().or(z.literal("")),
  appliedDate: z.string().min(1, "Requerido"),
  nextDate: z.string().min(1, "Requerido"),
  batchNumber: z.string().trim().optional().or(z.literal("")),
  veterinarian: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const userSchema = z.object({
  name: z.string().trim().min(1, "Requerido"),
  email: z.string().trim().email("Email inválido"),
  role: z.enum(["ADMIN", "VETERINARIO", "RECEPCION"]),
  password: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal("")),
});

export const clinicSettingsSchema = z.object({
  name: z.string().trim().min(1, "Requerido"),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
});

export const reminderSettingsSchema = z.object({
  daysBefore1: z.coerce.number().int().min(0),
  daysBefore2: z.coerce.number().int().min(0),
  daysBefore3: z.coerce.number().int().min(0),
  dayOf: z.coerce.number().int().min(0),
  daysAfter: z.coerce.number().int().min(0),
  retryOnError: z.coerce.boolean(),
});

export type FormState = { error?: string; fieldErrors?: Record<string, string> };

export function zodErrorToFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
