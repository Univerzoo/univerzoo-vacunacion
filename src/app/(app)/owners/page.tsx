import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader, Card, LinkButton, EmptyState, Input } from "@/components/ui/primitives";

export default async function OwnersPage({ searchParams }: PageProps<"/owners">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const owners = await db.owner.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { whatsapp: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pets: true } } },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Propietarios"
        description="Gestión de propietarios de mascotas"
        actions={<LinkButton href="/owners/new">+ Nuevo propietario</LinkButton>}
      />

      <Card className="mb-4">
        <form className="flex gap-2">
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, teléfono o email..."
          />
        </form>
      </Card>

      <Card className="overflow-x-auto">
        {owners.length === 0 ? (
          <EmptyState message="No se encontraron propietarios." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                <th className="py-2 pr-3">Nombre</th>
                <th className="py-2 pr-3">WhatsApp</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Ciudad</th>
                <th className="py-2 pr-3">Mascotas</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id} className="border-b border-brand-border last:border-0">
                  <td className="py-2 pr-3 font-medium text-brand-brown">
                    {owner.firstName} {owner.lastName}
                  </td>
                  <td className="py-2 pr-3">{owner.whatsapp}</td>
                  <td className="py-2 pr-3">{owner.email ?? "—"}</td>
                  <td className="py-2 pr-3">{owner.city ?? "—"}</td>
                  <td className="py-2 pr-3">{owner._count.pets}</td>
                  <td className="py-2 pr-3">
                    {owner.active ? (
                      <span className="text-status-al-dia text-xs font-medium">Activo</span>
                    ) : (
                      <span className="text-brand-brown-soft text-xs font-medium">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <Link
                      href={`/owners/${owner.id}`}
                      className="text-brand-orange-dark font-medium hover:underline"
                    >
                      Ver
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
