import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Card, Button, LinkButton, EmptyState } from "@/components/ui/primitives";
import { VaccineTypeForm } from "./vaccine-type-form";
import { createVaccineTypeAction, toggleVaccineTypeActiveAction } from "./actions";

export default async function VaccinesPage() {
  await requireRole(["ADMIN"]);

  const [vaccineTypes, species] = await Promise.all([
    db.vaccineType.findMany({ include: { species: true }, orderBy: { name: "asc" } }),
    db.species.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Catálogo de vacunas" description="Tipos de vacuna disponibles para registrar vacunaciones" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Nueva vacuna</h2>
          <VaccineTypeForm action={createVaccineTypeAction} species={species} submitLabel="Agregar" />
        </Card>

        <Card className="lg:col-span-2 overflow-x-auto">
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Vacunas registradas</h2>
          {vaccineTypes.length === 0 ? (
            <EmptyState message="Todavía no hay vacunas en el catálogo." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">Especie</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {vaccineTypes.map((v) => {
                  const toggle = toggleVaccineTypeActiveAction.bind(null, v.id, !v.active);
                  return (
                    <tr key={v.id} className="border-b border-brand-border last:border-0">
                      <td className="py-2 pr-3 font-medium text-brand-brown">{v.name}</td>
                      <td className="py-2 pr-3">{v.species?.name ?? "Todas"}</td>
                      <td className="py-2 pr-3">
                        {v.active ? (
                          <span className="text-status-al-dia text-xs font-medium">Activa</span>
                        ) : (
                          <span className="text-brand-brown-soft text-xs font-medium">Inactiva</span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <LinkButton href={`/vaccines/${v.id}/edit`} variant="ghost" className="px-2 py-1 text-xs">
                            Editar
                          </LinkButton>
                          <form action={toggle}>
                            <Button type="submit" variant="ghost" className="px-2 py-1 text-xs">
                              {v.active ? "Desactivar" : "Activar"}
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
