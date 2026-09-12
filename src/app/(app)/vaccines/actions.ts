"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { vaccineTypeSchema, zodErrorToFieldErrors, type FormState } from "@/lib/validation";

function readInput(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    speciesId: String(formData.get("speciesId") ?? ""),
    description: String(formData.get("description") ?? ""),
  };
}

export async function createVaccineTypeAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = vaccineTypeSchema.safeParse(readInput(formData));
  if (!parsed.success) return { fieldErrors: zodErrorToFieldErrors(parsed.error) };

  const vt = await db.vaccineType.create({
    data: {
      name: parsed.data.name,
      speciesId: parsed.data.speciesId || null,
      description: parsed.data.description || null,
    },
  });

  await logAudit({ userId: session.sub, action: "CREATE", entity: "VaccineType", entityId: vt.id });
  revalidatePath("/vaccines");
  redirect("/vaccines");
}

export async function updateVaccineTypeAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = vaccineTypeSchema.safeParse(readInput(formData));
  if (!parsed.success) return { fieldErrors: zodErrorToFieldErrors(parsed.error) };

  await db.vaccineType.update({
    where: { id },
    data: {
      name: parsed.data.name,
      speciesId: parsed.data.speciesId || null,
      description: parsed.data.description || null,
    },
  });

  await logAudit({ userId: session.sub, action: "UPDATE", entity: "VaccineType", entityId: id });
  revalidatePath("/vaccines");
  redirect("/vaccines");
}

export async function toggleVaccineTypeActiveAction(id: string, active: boolean) {
  const session = await requireRole(["ADMIN"]);
  await db.vaccineType.update({ where: { id }, data: { active } });
  await logAudit({
    userId: session.sub,
    action: active ? "ACTIVATE" : "DEACTIVATE",
    entity: "VaccineType",
    entityId: id,
  });
  revalidatePath("/vaccines");
}
