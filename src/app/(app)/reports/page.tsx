import { db } from "@/lib/db";
import { PageHeader, Card, Label, Select, Input, Button } from "@/components/ui/primitives";

export default async function ReportsPage() {
  const [vaccineTypes, species] = await Promise.all([
    db.vaccineType.findMany({ orderBy: { name: "asc" } }),
    db.species.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Reportes" description="Exportá información en formato CSV" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Vacunaciones</h2>
          <form action="/api/reports/export" method="get" className="space-y-3">
            <input type="hidden" name="type" value="vaccinations" />
            <div>
              <Label htmlFor="from">Desde</Label>
              <Input id="from" name="from" type="date" />
            </div>
            <div>
              <Label htmlFor="to">Hasta</Label>
              <Input id="to" name="to" type="date" />
            </div>
            <div>
              <Label htmlFor="vaccineTypeId">Tipo de vacuna</Label>
              <Select id="vaccineTypeId" name="vaccineTypeId" defaultValue="">
                <option value="">Todas</option>
                {vaccineTypes.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="speciesId">Especie</Label>
              <Select id="speciesId" name="speciesId" defaultValue="">
                <option value="">Todas</option>
                {species.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="veterinarian">Veterinario</Label>
              <Input id="veterinarian" name="veterinarian" />
            </div>
            <Button type="submit" className="w-full">
              Descargar CSV
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Vencimientos</h2>
          <form action="/api/reports/export" method="get" className="space-y-3">
            <input type="hidden" name="type" value="vencimientos" />
            <div>
              <Label htmlFor="range">Rango</Label>
              <Select id="range" name="range" defaultValue="7">
                <option value="7">Próximos 7 días</option>
                <option value="30">Próximos 30 días</option>
                <option value="vencidos">Vencidos</option>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Descargar CSV
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-brand-brown mb-3">WhatsApp</h2>
          <form action="/api/reports/export" method="get" className="space-y-3">
            <input type="hidden" name="type" value="whatsapp" />
            <div>
              <Label htmlFor="wa-status">Estado</Label>
              <Select id="wa-status" name="status" defaultValue="">
                <option value="">Todos</option>
                <option value="ENVIADO">Enviados</option>
                <option value="ENTREGADO">Entregados</option>
                <option value="LEIDO">Leídos</option>
                <option value="ERROR">Errores</option>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Descargar CSV
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
