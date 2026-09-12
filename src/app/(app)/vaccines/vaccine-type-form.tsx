"use client";

import { useActionState } from "react";
import { Input, Label, Textarea, Select, Button } from "@/components/ui/primitives";
import type { FormState } from "@/lib/validation";

type Action = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function VaccineTypeForm({
  action,
  species,
  defaultValues,
  submitLabel = "Guardar",
}: {
  action: Action;
  species: { id: string; name: string }[];
  defaultValues?: { name: string; speciesId: string | null; description: string | null };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" name="name" required defaultValue={defaultValues?.name} />
        {errors.name && <p className="text-xs text-status-vencida mt-1">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="speciesId">Especie aplicable</Label>
        <Select id="speciesId" name="speciesId" defaultValue={defaultValues?.speciesId ?? ""}>
          <option value="">Todas las especies</option>
          {species.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" rows={2} defaultValue={defaultValues?.description ?? ""} />
      </div>

      {state.error && <p className="md:col-span-2 text-sm text-status-vencida">{state.error}</p>}

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
