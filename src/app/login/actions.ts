"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSessionCookie, verifyPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/dashboard");

  if (!email || !password) {
    return { error: "Ingresá tu email y contraseña." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return { error: "Credenciales inválidas." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Credenciales inválidas." };
  }

  await createSessionCookie({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  await logAudit({
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
  });

  redirect(from.startsWith("/") ? from : "/dashboard");
}
