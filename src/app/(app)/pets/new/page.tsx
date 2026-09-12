import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/ui/primitives";
import { PetForm } from "../pet-form";
import { createPetAction } from "../actions";

export default async function NewPetPage({ searchParams }: PageProps<"/pets/new">) {
  const params = await searchParams;
  const ownerId = typeof params.ownerId === "string" ? params.ownerId : undefined;

  const [species, owner, owners] = await Promise.all([
    db.species.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    ownerId ? db.owner.findUnique({ where: { id: ownerId } }) : null,
    ownerId ? null : db.owner.findMany({ where: { active: true }, orderBy: { firstName: "asc" }, take: 300 }),
  ]);

  return (
    <div>
      <PageHeader title="Nueva mascota" />
      <Card>
        <PetForm
          action={createPetAction}
          species={species}
          owners={owners ?? undefined}
          fixedOwner={owner ? { id: owner.id, name: `${owner.firstName} ${owner.lastName}` } : undefined}
        />
      </Card>
    </div>
  );
}
