import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader, Card, EmptyState } from "@/components/ui/primitives";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const [owners, pets] = q
    ? await Promise.all([
        db.owner.findMany({
          where: {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { whatsapp: { contains: q } },
              { phone: { contains: q } },
            ],
          },
          take: 25,
        }),
        db.pet.findMany({
          where: {
            OR: [
              { name: { contains: q } },
              { fileNumber: { contains: q } },
              { microchip: { contains: q } },
              { vaccinations: { some: { vaccineType: { name: { contains: q } } } } },
            ],
          },
          include: { owner: true, species: true },
          take: 25,
        }),
      ])
    : [[], []];

  const noResults = q && owners.length === 0 && pets.length === 0;

  return (
    <div>
      <PageHeader title="Resultados de búsqueda" description={q ? `"${q}"` : "Ingresá un término de búsqueda"} />

      {noResults && (
        <Card>
          <EmptyState message="No se encontraron resultados." />
        </Card>
      )}

      {owners.length > 0 && (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Propietarios</h2>
          <ul className="divide-y divide-brand-border">
            {owners.map((o) => (
              <li key={o.id} className="py-2 flex items-center justify-between">
                <span>
                  {o.firstName} {o.lastName} · {o.whatsapp}
                </span>
                <Link href={`/owners/${o.id}`} className="text-brand-orange-dark text-sm font-medium hover:underline">
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {pets.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Mascotas</h2>
          <ul className="divide-y divide-brand-border">
            {pets.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between">
                <span>
                  {p.name} ({p.species?.name ?? "—"}) · {p.owner.firstName} {p.owner.lastName}
                </span>
                <Link href={`/pets/${p.id}`} className="text-brand-orange-dark text-sm font-medium hover:underline">
                  Ver ficha
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
