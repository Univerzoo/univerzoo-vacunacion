import { format } from "date-fns";
import { db } from "@/lib/db";
import { PageHeader, Card, EmptyState, Select, Button } from "@/components/ui/primitives";
import { MessageStatusBadge } from "@/components/ui/status-badge";
import { retryMessageAction } from "./actions";
import type { EstadoMensaje } from "@/generated/prisma/enums";

const STAGE_LABELS: Record<string, string> = {
  DIAS_30: "30 días antes",
  DIAS_7: "7 días antes",
  DIA_1: "1 día antes",
  DIA_0: "Día de vacunación",
  VENCIDA_7: "Vencida",
};

export default async function MessagesPage({ searchParams }: PageProps<"/messages">) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? (params.status as EstadoMensaje) : "";

  const messages = await db.message.findMany({
    where: status ? { status } : undefined,
    include: { owner: true, pet: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <PageHeader title="Mensajes" description="Registro de recordatorios enviados por WhatsApp" />

      <Card className="mb-4">
        <form className="flex gap-2">
          <div className="w-56">
            <Select name="status" defaultValue={status}>
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ENVIADO">Enviado</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="LEIDO">Leído</option>
              <option value="ERROR">Error</option>
            </Select>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        {messages.length === 0 ? (
          <EmptyState message="No hay mensajes registrados." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Mascota</th>
                <th className="py-2 pr-3">Propietario</th>
                <th className="py-2 pr-3">Etapa</th>
                <th className="py-2 pr-3">WhatsApp</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3">Error</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => {
                const retry = retryMessageAction.bind(null, m.id);
                return (
                  <tr key={m.id} className="border-b border-brand-border last:border-0">
                    <td className="py-2 pr-3">{format(m.createdAt, "dd/MM/yyyy HH:mm")}</td>
                    <td className="py-2 pr-3 font-medium text-brand-brown">{m.pet.name}</td>
                    <td className="py-2 pr-3">
                      {m.owner.firstName} {m.owner.lastName}
                    </td>
                    <td className="py-2 pr-3">{STAGE_LABELS[m.stage] ?? m.stage}</td>
                    <td className="py-2 pr-3">{m.whatsappNumber}</td>
                    <td className="py-2 pr-3">
                      <MessageStatusBadge status={m.status} />
                    </td>
                    <td className="py-2 pr-3 text-xs text-status-vencida max-w-[220px] truncate">{m.error ?? ""}</td>
                    <td className="py-2 pr-3">
                      {m.status === "ERROR" && (
                        <form action={retry}>
                          <Button type="submit" variant="ghost" className="px-2 py-1 text-xs">
                            Reintentar
                          </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
