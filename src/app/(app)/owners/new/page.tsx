import { PageHeader, Card } from "@/components/ui/primitives";
import { OwnerForm } from "../owner-form";
import { createOwnerAction } from "../actions";

export default function NewOwnerPage() {
  return (
    <div>
      <PageHeader title="Nuevo propietario" />
      <Card>
        <OwnerForm action={createOwnerAction} />
      </Card>
    </div>
  );
}
