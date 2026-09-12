"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { parseDateInput } from "@/lib/dates";
import { vaccinationSchema, zodErrorToFieldErrors, type FormState } from "@/lib/validation";

function readInput(formData: FormData) {
  return {
    petId: String(formData.get("petId") ?? ""),
    vaccineTypeId: String(formData.get("vaccineTypeId") ?? ""),
    commercialName: String(formData.get("commercialName") ?? ""),
    appliedDate: String(formData.get("appliedDate") ?? ""),
    nextDate: String(formData.get("nextDate") ?? ""),
    batchNumber: String(formData.get("batchNumber") ?? ""),
    veterinarian: String(formData.get("veterinarian") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createVaccinationAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireUser();
  const parsed = vaccinationSchema.safeParse(readInput(formData));
  if (!parsed.success) {
    return { fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }
  const d = parsed.data;

  const vaccination = await db.vaccination.create({
    data: {
      petId: d.petId,
      vaccineTypeId: d.vaccineTypeId,
      commercialName: d.commercialName || null,
      appliedDate: parseDateInput(d.appliedDate),
      nextDate: parseDateInput(d.nextDate),
      batchNumber: d.batchNumber || null,
      veterinarian: d.veterinarian || null,
      notes: d.notes || null,
      createdByUserId: session.sub,
    },
  });

  await logAudit({
    userId: session.sub,
    action: "CREATE",
    entity: "Vaccination",
    entityId: vaccination.id,
    details: { nextDate: d.nextDate },
  });

  revalidatePath(`/pets/${d.petId}`);
  revalidatePath("/vaccinations");
  revalidatePath("/dashboard");
  redirect(`/pets/${d.petId}`);
}

export async function cancelVaccinationAction(id: string, petId: string) {
  const session = await requireUser();
  await db.vaccination.update({
    where: { id },
    data: { cancelled: true, cancelledAt: new Date() },
  });
  await logAudit({ userId: session.sub, action: "CANCEL", entity: "Vaccination", entityId: id });
  revalidatePath(`/pets/${petId}`);
  revalidatePath("/vaccinations");
  revalidatePath("/dashboard");
}
