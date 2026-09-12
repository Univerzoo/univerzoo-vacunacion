import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, Card, LinkButton, Button, EmptyState } from "@/components/ui/primitives";
import { toggleOwnerActiveAction } from "../actions";

export default async function OwnerDetailPage({ params }: PageProps<"/owners/[id]">) {
  const { id } = await params;
  const owner = await db.owner.findUnique({
    where: { id },
    include: { pets: { include: { species: true }, orderBy: { name: "asc" } } },
  });
  if (!owner) notFound();

  const toggleAction = toggleOwnerActiveAction.bind(null, owner.id, !owner.active);

  return (
    <div>
      <PageHeader
        title={`${owner.firstName} ${owner.lastName}`}
        description={owner.active ? "Propietario activo" : "Propietario inactivo"}
        actions={
          <>
            <LinkButton href={`/owners/${owner.id}/edit`} variant="secondary">
              Editar
            </LinkButton>
            <form action={toggleAction}>
              <Button type="submit" variant={owner.active ? "danger" : "ghost"}>
                {owner.active ? "Desactivar" : "Activar"}
              </Button>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Datos de contacto</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-brand-brown-soft">WhatsApp</dt>
              <dd className="font-medium">{owner.whatsapp}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-brown-soft">Teléfono</dt>
              <dd>{owner.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-brown-soft">Email</dt>
              <dd>{owner.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-brown-soft">Ciudad</dt>
              <dd>{owner.city ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brand-brown-soft">Dirección</dt>
              <dd className="text-right">{owner.address ?? "—"}</dd>
            </div>
            {owner.notes && (
              <div>
                <dt className="text-brand-brown-soft mb-1">Observaciones</dt>
                <dd>{owner.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-brand-brown">Mascotas</h2>
            <LinkButton href={`/pets/new?ownerId=${owner.id}`} variant="secondary">
              + Agregar mascota
            </LinkButton>
          </div>
          {owner.pets.length === 0 ? (
            <EmptyState message="Este propietario todavía no tiene mascotas registradas." />
          ) : (
            <ul className="divide-y divide-brand-border">
              {owner.pets.map((pet) => (
                <li key={pet.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-brand-brown">{pet.name}</p>
                    <p className="text-xs text-brand-brown-soft">
                      {pet.species?.name ?? "Especie no definida"}
                      {pet.breed ? ` · ${pet.breed}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/pets/${pet.id}`}
                    className="text-brand-orange-dark text-sm font-medium hover:underline"
                  >
                    Ver ficha
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
