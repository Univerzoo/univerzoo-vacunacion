import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/ui/primitives";
import { VaccinationForm } from "../vaccination-form";
import { createVaccinationAction } from "../actions";

export default async function NewVaccinationPage({ searchParams }: PageProps<"/vaccinations/new">) {
  const params = await searchParams;
  const petId = typeof params.petId === "string" ? params.petId : undefined;

  const [vaccineTypes, pet, pets] = await Promise.all([
    db.vaccineType.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    petId ? db.pet.findUnique({ where: { id: petId }, include: { owner: true } }) : null,
    petId
      ? null
      : db.pet.findMany({
          where: { active: true },
          include: { owner: true },
          orderBy: { name: "asc" },
          take: 300,
        }),
  ]);

  return (
    <div>
      <PageHeader title="Nueva vacunación" />
      <Card>
        <VaccinationForm
          action={createVaccinationAction}
          vaccineTypes={vaccineTypes}
          fixedPet={pet ? { id: pet.id, label: `${pet.name} (${pet.owner.firstName} ${pet.owner.lastName})` } : undefined}
          pets={pets?.map((p) => ({ id: p.id, name: p.name, ownerName: `${p.owner.firstName} ${p.owner.lastName}` }))}
        />
      </Card>
    </div>
  );
}
