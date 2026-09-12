"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/auth";
import { userSchema, zodErrorToFieldErrors, type FormState } from "@/lib/validation";

export async function createUserAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireRole(["ADMIN"]);

  const parsed = userSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? "RECEPCION"),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { fieldErrors: zodErrorToFieldErrors(parsed.error) };
  if (!parsed.data.password) {
    return { fieldErrors: { password: "La contraseña es obligatoria para nuevos usuarios." } };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { fieldErrors: { email: "Ya existe un usuario con ese email." } };
  }

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  await logAudit({ userId: session.sub, action: "CREATE", entity: "User", entityId: user.id });
  revalidatePath("/users");
  return {};
}

export async function toggleUserActiveAction(id: string, active: boolean) {
  const session = await requireRole(["ADMIN"]);
  await db.user.update({ where: { id }, data: { active } });
  await logAudit({
    userId: session.sub,
    action: active ? "ACTIVATE" : "DEACTIVATE",
    entity: "User",
    entityId: id,
  });
  revalidatePath("/users");
}

export async function resetPasswordAction(id: string, formData: FormData) {
  const session = await requireRole(["ADMIN"]);
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return;

  await db.user.update({ where: { id }, data: { passwordHash: await hashPassword(password) } });
  await logAudit({ userId: session.sub, action: "RESET_PASSWORD", entity: "User", entityId: id });
  revalidatePath("/users");
}
