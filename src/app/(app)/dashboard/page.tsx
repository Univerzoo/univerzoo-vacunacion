import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard";
import { PageHeader, Card, EmptyState } from "@/components/ui/primitives";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VaccinationStatusChart } from "@/components/vaccination-status-chart";
import { format } from "date-fns";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen general de la clínica"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Propietarios" value={data.totalOwners} />
        <StatCard label="Mascotas" value={data.totalPets} />
        <StatCard label="Recordatorios enviados" value={data.sentMessages} tone="success" />
        <StatCard label="Mensajes pendientes" value={data.pendingMessages} tone="warning" />
        <StatCard label="Vacunas próximas" value={data.counts.proxima} tone="warning" />
        <StatCard label="Vencen hoy" value={data.counts.venceHoy} tone="orange" />
        <StatCard label="Vencidas" value={data.counts.vencida} tone="danger" />
        <StatCard label="Mensajes con error" value={data.errorMessages} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-brand-brown mb-2">
            Estado de vacunaciones
          </h2>
          <VaccinationStatusChart counts={data.counts} />
        </Card>

        <Card className="lg:col-span-2 overflow-x-auto">
          <h2 className="text-sm font-semibold text-brand-brown mb-4">
            Próximas vacunaciones
          </h2>
          {data.proximas.length === 0 ? (
            <EmptyState message="No hay vacunaciones próximas ni vencimientos hoy." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                  <th className="py-2 pr-3">Mascota</th>
                  <th className="py-2 pr-3">Propietario</th>
                  <th className="py-2 pr-3">Vacuna</th>
                  <th className="py-2 pr-3">Fecha</th>
                  <th className="py-2 pr-3">Días</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.proximas.map((v) => (
                  <tr key={v.id} className="border-b border-brand-border last:border-0">
                    <td className="py-2 pr-3 font-medium text-brand-brown">
                      {v.pet.name}
                    </td>
                    <td className="py-2 pr-3">
                      {v.pet.owner.firstName} {v.pet.owner.lastName}
                    </td>
                    <td className="py-2 pr-3">{v.vaccineType.name}</td>
                    <td className="py-2 pr-3">{format(v.nextDate, "dd/MM/yyyy")}</td>
                    <td className="py-2 pr-3">{v.remaining}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-2 pr-3">
                      <Link
                        href={`/pets/${v.petId}`}
                        className="text-brand-orange-dark font-medium hover:underline"
                      >
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
    </div>
  );
}
