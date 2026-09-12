import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/ui/primitives";
import { PetForm } from "../../pet-form";
import { updatePetAction } from "../../actions";

export default async function EditPetPage({ params }: PageProps<"/pets/[id]/edit">) {
  const { id } = await params;
  const [pet, species] = await Promise.all([
    db.pet.findUnique({ where: { id }, include: { owner: true } }),
    db.species.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!pet) notFound();

  const action = updatePetAction.bind(null, id);

  return (
    <div>
      <PageHeader title={`Editar mascota: ${pet.name}`} />
      <Card>
        <PetForm
          action={action}
          species={species}
          fixedOwner={{ id: pet.owner.id, name: `${pet.owner.firstName} ${pet.owner.lastName}` }}
          defaultValues={pet}
        />
      </Card>
    </div>
  );
}
