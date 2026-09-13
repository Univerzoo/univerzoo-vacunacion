import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader, Card, LinkButton, EmptyState, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";
import { computeStatus } from "@/lib/status";
import { getReminderSettings } from "@/lib/settings";
import { format } from "date-fns";
import type { VaccinationStatus } from "@/lib/status";

const PENDING_MARKER = "no registrada en la ficha original";

export default async function VaccinationsPage({ searchParams }: PageProps<"/vaccinations">) {
  const params = await searchParams;
  const statusFilter = typeof params.status === "string" ? (params.status as VaccinationStatus) : "";
  const pendingOnly = params.pending === "1";

  const [reminderSettings, vaccinations] = await Promise.all([
    getReminderSettings(),
    db.vaccination.findMany({
      where: pendingOnly ? { notes: { contains: PENDING_MARKER } } : undefined,
      include: { pet: { include: { owner: true } }, vaccineType: true },
      orderBy: { nextDate: "asc" },
      take: 1000,
    }),
  ]);

  const withStatus = vaccinations
    .filter((v) => !v.cancelled)
    .map((v) => ({ ...v, status: computeStatus(v.nextDate, reminderSettings.daysBefore1) }))
    .filter((v) => !statusFilter || v.status === statusFilter);

  return (
    <div>
      <PageHeader
        title="Vacunaciones"
        description="Historial y estado de vacunaciones registradas"
        actions={<LinkButton href="/vaccinations/new">+ Nueva vacunación</LinkButton>}
      />

      <Card className="mb-4">
        <form className="flex gap-2 items-end flex-wrap">
          <div className="w-56">
            <Select name="status" defaultValue={statusFilter}>
              <option value="">Todos los estados</option>
              <option value="AL_DIA">Al día</option>
              <option value="PROXIMA">Próxima</option>
              <option value="VENCE_HOY">Vence hoy</option>
              <option value="VENCIDA">Vencida</option>
            </Select>
          </div>
        </form>
        <div className="mt-3">
          {pendingOnly ? (
            <LinkButton href="/vaccinations" variant="ghost">
              ← Ver todas
            </LinkButton>
          ) : (
            <LinkButton href="/vaccinations?pending=1" variant="secondary">
              Ver solo pendientes de fecha real (migración)
            </LinkButton>
          )}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        {withStatus.length === 0 ? (
          <EmptyState message="No hay vacunaciones para este filtro." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                <th className="py-2 pr-3">Mascota</th>
                <th className="py-2 pr-3">Propietario</th>
                <th className="py-2 pr-3">Vacuna</th>
                <th className="py-2 pr-3">Aplicada</th>
                <th className="py-2 pr-3">Próxima</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {withStatus.map((v) => (
                <tr key={v.id} className="border-b border-brand-border last:border-0">
                  <td className="py-2 pr-3 font-medium text-brand-brown">{v.pet.name}</td>
                  <td className="py-2 pr-3">
                    {v.pet.owner.firstName} {v.pet.owner.lastName}
                  </td>
                  <td className="py-2 pr-3">{v.vaccineType.name}</td>
                  <td className="py-2 pr-3">{format(v.appliedDate, "dd/MM/yyyy")}</td>
                  <td className="py-2 pr-3">{format(v.nextDate, "dd/MM/yyyy")}</td>
                  <td className="py-2 pr-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="py-2 pr-3">
                    <Link href={`/pets/${v.petId}`} className="text-brand-orange-dark font-medium hover:underline">
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
