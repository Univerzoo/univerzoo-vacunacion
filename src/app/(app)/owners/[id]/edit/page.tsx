import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/ui/primitives";
import { OwnerForm } from "../../owner-form";
import { updateOwnerAction } from "../../actions";

export default async function EditOwnerPage({ params }: PageProps<"/owners/[id]/edit">) {
  const { id } = await params;
  const owner = await db.owner.findUnique({ where: { id } });
  if (!owner) notFound();

  const action = updateOwnerAction.bind(null, id);

  return (
    <div>
      <PageHeader title={`Editar propietario: ${owner.firstName} ${owner.lastName}`} />
      <Card>
        <OwnerForm action={action} defaultValues={owner} />
      </Card>
    </div>
  );
}
