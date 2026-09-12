import { format } from "date-fns";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Card, EmptyState } from "@/components/ui/primitives";

export default async function AuditPage() {
  await requireRole(["ADMIN"]);

  const logs = await db.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div>
      <PageHeader title="Auditoría" description="Registro de acciones importantes del sistema" />
      <Card className="overflow-x-auto">
        {logs.length === 0 ? (
          <EmptyState message="Todavía no hay eventos registrados." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Usuario</th>
                <th className="py-2 pr-3">Acción</th>
                <th className="py-2 pr-3">Entidad</th>
                <th className="py-2 pr-3">ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-brand-border last:border-0">
                  <td className="py-2 pr-3">{format(log.createdAt, "dd/MM/yyyy HH:mm:ss")}</td>
                  <td className="py-2 pr-3">{log.user?.name ?? "Sistema"}</td>
                  <td className="py-2 pr-3 font-medium text-brand-brown">{log.action}</td>
                  <td className="py-2 pr-3">{log.entity}</td>
                  <td className="py-2 pr-3 text-xs text-brand-brown-soft">{log.entityId ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
