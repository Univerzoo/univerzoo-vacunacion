import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader, Card, LinkButton, EmptyState, Input } from "@/components/ui/primitives";

export default async function PetsPage({ searchParams }: PageProps<"/pets">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const pets = await db.pet.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { fileNumber: { contains: q } },
            { microchip: { contains: q } },
            { owner: { firstName: { contains: q } } },
            { owner: { lastName: { contains: q } } },
          ],
        }
      : undefined,
    include: { owner: true, species: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Mascotas"
        description="Listado general de mascotas"
        actions={<LinkButton href="/pets/new">+ Nueva mascota</LinkButton>}
      />

      <Card className="mb-4">
        <form className="flex gap-2">
          <Input type="search" name="q" defaultValue={q} placeholder="Buscar por nombre, ficha, microchip o propietario..." />
        </form>
      </Card>

      <Card className="overflow-x-auto">
        {pets.length === 0 ? (
          <EmptyState message="No se encontraron mascotas." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                <th className="py-2 pr-3">Nombre</th>
                <th className="py-2 pr-3">Especie</th>
                <th className="py-2 pr-3">Propietario</th>
                <th className="py-2 pr-3">Ficha</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id} className="border-b border-brand-border last:border-0">
                  <td className="py-2 pr-3 font-medium text-brand-brown">{pet.name}</td>
                  <td className="py-2 pr-3">{pet.species?.name ?? "—"}</td>
                  <td className="py-2 pr-3">
                    {pet.owner.firstName} {pet.owner.lastName}
                  </td>
                  <td className="py-2 pr-3">{pet.fileNumber ?? "—"}</td>
                  <td className="py-2 pr-3">
                    {pet.active ? (
                      <span className="text-status-al-dia text-xs font-medium">Activa</span>
                    ) : (
                      <span className="text-brand-brown-soft text-xs font-medium">Inactiva</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <Link href={`/pets/${pet.id}`} className="text-brand-orange-dark font-medium hover:underline">
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
