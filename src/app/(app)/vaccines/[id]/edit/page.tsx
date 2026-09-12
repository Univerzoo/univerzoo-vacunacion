import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/ui/primitives";
import { VaccineTypeForm } from "../../vaccine-type-form";
import { updateVaccineTypeAction } from "../../actions";

export default async function EditVaccineTypePage({ params }: PageProps<"/vaccines/[id]/edit">) {
  await requireRole(["ADMIN"]);
  const { id } = await params;

  const [vaccineType, species] = await Promise.all([
    db.vaccineType.findUnique({ where: { id } }),
    db.species.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!vaccineType) notFound();

  const action = updateVaccineTypeAction.bind(null, id);

  return (
    <div>
      <PageHeader title={`Editar vacuna: ${vaccineType.name}`} />
      <Card>
        <VaccineTypeForm action={action} species={species} defaultValues={vaccineType} />
      </Card>
    </div>
  );
}
