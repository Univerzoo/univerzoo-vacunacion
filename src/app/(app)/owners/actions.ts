"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { ownerSchema, zodErrorToFieldErrors, type FormState } from "@/lib/validation";

function readOwnerInput(formData: FormData) {
  return {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createOwnerAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireUser();
  const parsed = ownerSchema.safeParse(readOwnerInput(formData));
  if (!parsed.success) {
    return { fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }

  const owner = await db.owner.create({
    data: {
      ...parsed.data,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      notes: parsed.data.notes || null,
    },
  });

  await logAudit({
    userId: session.sub,
    action: "CREATE",
    entity: "Owner",
    entityId: owner.id,
  });

  revalidatePath("/owners");
  redirect(`/owners/${owner.id}`);
}

export async function updateOwnerAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireUser();
  const parsed = ownerSchema.safeParse(readOwnerInput(formData));
  if (!parsed.success) {
    return { fieldErrors: zodErrorToFieldErrors(parsed.error) };
  }

  await db.owner.update({
    where: { id },
    data: {
      ...parsed.data,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      notes: parsed.data.notes || null,
    },
  });

  await logAudit({ userId: session.sub, action: "UPDATE", entity: "Owner", entityId: id });

  revalidatePath("/owners");
  revalidatePath(`/owners/${id}`);
  redirect(`/owners/${id}`);
}

export async function toggleOwnerActiveAction(id: string, active: boolean) {
  const session = await requireUser();
  await db.owner.update({ where: { id }, data: { active } });
  await logAudit({
    userId: session.sub,
    action: active ? "ACTIVATE" : "DEACTIVATE",
    entity: "Owner",
    entityId: id,
  });
  revalidatePath("/owners");
  revalidatePath(`/owners/${id}`);
}
