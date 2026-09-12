"use server";

import { redirect } from "next/navigation";
import { destroySessionCookie, getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function logoutAction() {
  const session = await getSession();
  await destroySessionCookie();
  if (session) {
    await logAudit({ userId: session.sub, action: "LOGOUT", entity: "User", entityId: session.sub });
  }
  redirect("/login");
}
