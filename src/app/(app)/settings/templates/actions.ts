"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function updateTemplateAction(id: string, formData: FormData) {
  const session = await requireRole(["ADMIN"]);

  await db.messageTemplate.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      whatsappTemplateName: String(formData.get("whatsappTemplateName") ?? ""),
      content: String(formData.get("content") ?? ""),
      active: formData.get("active") === "on",
    },
  });

  await logAudit({ userId: session.sub, action: "UPDATE", entity: "MessageTemplate", entityId: id });
  revalidatePath("/settings/templates");
}
