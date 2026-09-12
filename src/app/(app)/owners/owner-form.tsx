"use client";

import { useActionState } from "react";
import { Input, Label, Textarea, Button } from "@/components/ui/primitives";
import type { FormState } from "@/lib/validation";

type OwnerFormAction = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

export function OwnerForm({
  action,
  defaultValues,
}: {
  action: OwnerFormAction;
  defaultValues?: {
    firstName: string;
    lastName: string;
    whatsapp: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    notes: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="firstName">Nombre *</Label>
        <Input id="firstName" name="firstName" required defaultValue={defaultValues?.firstName} />
        {errors.firstName && <p className="text-xs text-status-vencida mt-1">{errors.firstName}</p>}
      </div>
      <div>
        <Label htmlFor="lastName">Apellido *</Label>
        <Input id="lastName" name="lastName" required defaultValue={defaultValues?.lastName} />
        {errors.lastName && <p className="text-xs text-status-vencida mt-1">{errors.lastName}</p>}
      </div>
      <div>
        <Label htmlFor="whatsapp">WhatsApp * (formato internacional)</Label>
        <Input
          id="whatsapp"
          name="whatsapp"
          required
          placeholder="+595981123456"
          defaultValue={defaultValues?.whatsapp}
        />
        {errors.whatsapp && <p className="text-xs text-status-vencida mt-1">{errors.whatsapp}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
        {errors.email && <p className="text-xs text-status-vencida mt-1">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="city">Ciudad</Label>
        <Input id="city" name="city" defaultValue={defaultValues?.city ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" name="address" defaultValue={defaultValues?.address ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="notes">Observaciones</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={defaultValues?.notes ?? ""} />
      </div>

      {state.error && <p className="md:col-span-2 text-sm text-status-vencida">{state.error}</p>}

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
