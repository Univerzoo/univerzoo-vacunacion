import "server-only";
import { db } from "@/lib/db";

export async function logAudit(entry: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: unknown;
}) {
  await db.auditLog.create({
    data: {
      userId: entry.userId ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      details: entry.details ? JSON.stringify(entry.details) : null,
    },
  });
}
