import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { computeStatus } from "@/lib/status";
import { getReminderSettings } from "@/lib/settings";
import { PageHeader, Card, LinkButton, Button, EmptyState } from "@/components/ui/primitives";
import { StatusBadge, MessageStatusBadge } from "@/components/ui/status-badge";
import { togglePetActiveAction } from "../actions";
import { cancelVaccinationAction } from "../../vaccinations/actions";

const SEX_LABELS: Record<string, string> = { MACHO: "Macho", HEMBRA: "Hembra" };

export default async function PetDetailPage({ params }: PageProps<"/pets/[id]">) {
  const { id } = await params;

  const [pet, reminderSettings] = await Promise.all([
    db.pet.findUnique({
      where: { id },
      include: {
        owner: true,
        species: true,
        vaccinations: {
          include: { vaccineType: true },
          orderBy: { appliedDate: "desc" },
        },
        messages: {
          include: { template: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    }),
    getReminderSettings(),
  ]);

  if (!pet) notFound();

  const toggleAction = togglePetActiveAction.bind(null, pet.id, !pet.active);

  return (
    <div>
      <PageHeader
        title={pet.name}
        description={`${pet.owner.firstName} ${pet.owner.lastName} · ${pet.species?.name ?? "Especie no definida"}${pet.breed ? ` · ${pet.breed}` : ""}`}
        actions={
          <>
            <LinkButton href={`/vaccinations/new?petId=${pet.id}`}>+ Nueva vacunación</LinkButton>
            <LinkButton href={`/pets/${pet.id}/edit`} variant="secondary">
              Editar
            </LinkButton>
            <form action={toggleAction}>
              <Button type="submit" variant={pet.active ? "danger" : "ghost"}>
                {pet.active ? "Desactivar" : "Activar"}
              </Button>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card>
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Datos</h2>
          <dl className="text-sm space-y-2">
            <Row label="Propietario">
              <Link href={`/owners/${pet.owner.id}`} className="text-brand-orange-dark hover:underline">
                {pet.owner.firstName} {pet.owner.lastName}
              </Link>
            </Row>
            <Row label="Sexo">{pet.sex ? SEX_LABELS[pet.sex] : "—"}</Row>
            <Row label="Nacimiento">{pet.birthDate ? format(pet.birthDate, "dd/MM/yyyy") : "—"}</Row>
            <Row label="Color">{pet.color ?? "—"}</Row>
            <Row label="Peso">{pet.weight ? `${pet.weight} kg` : "—"}</Row>
            <Row label="Ficha">{pet.fileNumber ?? "—"}</Row>
            <Row label="Microchip">{pet.microchip ?? "—"}</Row>
            {pet.notes && <Row label="Notas">{pet.notes}</Row>}
          </dl>
        </Card>

        <Card className="lg:col-span-2 overflow-x-auto">
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Vacunas (historial)</h2>
          {pet.vaccinations.length === 0 ? (
            <EmptyState message="Todavía no hay vacunaciones registradas." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                  <th className="py-2 pr-3">Vacuna</th>
                  <th className="py-2 pr-3">Aplicada</th>
                  <th className="py-2 pr-3">Próxima</th>
                  <th className="py-2 pr-3">Lote</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {pet.vaccinations.map((v) => {
                  const status = v.cancelled ? null : computeStatus(v.nextDate, reminderSettings.daysBefore1);
                  const cancelAction = cancelVaccinationAction.bind(null, v.id, pet.id);
                  return (
                    <tr key={v.id} className="border-b border-brand-border last:border-0">
                      <td className="py-2 pr-3 font-medium text-brand-brown">{v.vaccineType.name}</td>
                      <td className="py-2 pr-3">{format(v.appliedDate, "dd/MM/yyyy")}</td>
                      <td className="py-2 pr-3">{format(v.nextDate, "dd/MM/yyyy")}</td>
                      <td className="py-2 pr-3">{v.batchNumber ?? "—"}</td>
                      <td className="py-2 pr-3">
                        {v.cancelled ? (
                          <span className="text-xs font-medium text-brand-brown-soft">Anulada</span>
                        ) : (
                          status && <StatusBadge status={status} />
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        {!v.cancelled && (
                          <form action={cancelAction}>
                            <button
                              type="submit"
                              className="text-status-vencida text-xs font-medium hover:underline"
                            >
                              Anular
                            </button>
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

      <Card className="overflow-x-auto">
        <h2 className="text-sm font-semibold text-brand-brown mb-3">Recordatorios enviados</h2>
        {pet.messages.length === 0 ? (
          <EmptyState message="Todavía no se enviaron recordatorios para esta mascota." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Plantilla</th>
                <th className="py-2 pr-3">WhatsApp</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3">Error</th>
              </tr>
            </thead>
            <tbody>
              {pet.messages.map((m) => (
                <tr key={m.id} className="border-b border-brand-border last:border-0">
                  <td className="py-2 pr-3">{format(m.createdAt, "dd/MM/yyyy HH:mm")}</td>
                  <td className="py-2 pr-3">{m.template?.name ?? "—"}</td>
                  <td className="py-2 pr-3">{m.whatsappNumber}</td>
                  <td className="py-2 pr-3">
                    <MessageStatusBadge status={m.status} />
                  </td>
                  <td className="py-2 pr-3 text-status-vencida text-xs">{m.error ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-brand-brown-soft">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
