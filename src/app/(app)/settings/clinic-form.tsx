"use client";

import { useActionState } from "react";
import { Input, Label, Button } from "@/components/ui/primitives";
import { updateClinicSettingsAction } from "./actions";

export function ClinicForm({
  defaultValues,
}: {
  defaultValues: { name: string; phone: string | null; whatsapp: string | null; address: string | null; email: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateClinicSettingsAction, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label htmlFor="name">Nombre de la clínica *</Label>
        <Input id="name" name="name" required defaultValue={defaultValues.name} />
        {errors.name && <p className="text-xs text-status-vencida mt-1">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" defaultValue={defaultValues.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input id="whatsapp" name="whatsapp" defaultValue={defaultValues.whatsapp ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" name="address" defaultValue={defaultValues.address ?? ""} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={defaultValues.email ?? ""} />
        {errors.email && <p className="text-xs text-status-vencida mt-1">{errors.email}</p>}
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
