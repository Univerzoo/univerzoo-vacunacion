import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/ui/primitives";
import { VaccinationForm } from "../../vaccination-form";
import { updateVaccinationAction } from "../../actions";

export default async function EditVaccinationPage({ params }: PageProps<"/vaccinations/[id]/edit">) {
  const { id } = await params;

  const [vaccination, vaccineTypes] = await Promise.all([
    db.vaccination.findUnique({ where: { id }, include: { pet: { include: { owner: true } } } }),
    db.vaccineType.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!vaccination) notFound();

  const action = updateVaccinationAction.bind(null, id, vaccination.petId);

  return (
    <div>
      <PageHeader title={`Editar vacunación de ${vaccination.pet.name}`} />
      <Card>
        <VaccinationForm
          action={action}
          vaccineTypes={vaccineTypes}
          fixedPet={{
            id: vaccination.pet.id,
            label: `${vaccination.pet.name} (${vaccination.pet.owner.firstName} ${vaccination.pet.owner.lastName})`,
          }}
          defaultValues={vaccination}
          submitLabel="Guardar cambios"
        />
      </Card>
    </div>
  );
}
