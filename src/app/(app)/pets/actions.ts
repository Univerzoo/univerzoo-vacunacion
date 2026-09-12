"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { parseDateInput } from "@/lib/dates";
import { petSchema, zodErrorToFieldErrors, type FormState } from "@/lib/validation";

function readPetInput(formData: FormData) {
  return {
    ownerId: String(formData.get("ownerId") ?? ""),
    name: String(formData.get("name") ?? ""),
    speciesId: String(formData.get("speciesId") ?? ""),
    breed: String(formData.get("breed") ?? ""),
    sex: String(formData.get("sex") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    color: String(formData.get("color") ?? ""),
    weight: String(formData.get("weight") ?? ""),
    fileNumber: String(formData.get("fileNumber") ?? ""),
    microchip: String(formData.get("microchip") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createPetAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireUser();
  const parsed = petSchema.safeParse(readPetInput(formData));
  if (!parsed.success) {
    return { fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }
  const d = parsed.data;

  const pet = await db.pet.create({
    data: {
      ownerId: d.ownerId,
      name: d.name,
      speciesId: d.speciesId || null,
      breed: d.breed || null,
      sex: d.sex ? (d.sex as "MACHO" | "HEMBRA") : null,
      birthDate: d.birthDate ? parseDateInput(d.birthDate) : null,
      color: d.color || null,
      weight: d.weight ? Number(d.weight) : null,
      fileNumber: d.fileNumber || null,
      microchip: d.microchip || null,
      notes: d.notes || null,
    },
  });

  await logAudit({ userId: session.sub, action: "CREATE", entity: "Pet", entityId: pet.id });

  revalidatePath(`/owners/${d.ownerId}`);
  revalidatePath("/pets");
  redirect(`/pets/${pet.id}`);
}

export async function updatePetAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireUser();
  const parsed = petSchema.safeParse(readPetInput(formData));
  if (!parsed.success) {
    return { fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }
  const d = parsed.data;

  await db.pet.update({
    where: { id },
    data: {
      name: d.name,
      speciesId: d.speciesId || null,
      breed: d.breed || null,
      sex: d.sex ? (d.sex as "MACHO" | "HEMBRA") : null,
      birthDate: d.birthDate ? parseDateInput(d.birthDate) : null,
      color: d.color || null,
      weight: d.weight ? Number(d.weight) : null,
      fileNumber: d.fileNumber || null,
      microchip: d.microchip || null,
      notes: d.notes || null,
    },
  });

  await logAudit({ userId: session.sub, action: "UPDATE", entity: "Pet", entityId: id });

  revalidatePath(`/pets/${id}`);
  revalidatePath("/pets");
  redirect(`/pets/${id}`);
}

export async function togglePetActiveAction(id: string, active: boolean) {
  const session = await requireUser();
  await db.pet.update({ where: { id }, data: { active } });
  await logAudit({
    userId: session.sub,
    action: active ? "ACTIVATE" : "DEACTIVATE",
    entity: "Pet",
    entityId: id,
  });
  revalidatePath(`/pets/${id}`);
  revalidatePath("/pets");
}
