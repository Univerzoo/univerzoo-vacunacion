"use client";

import { useActionState } from "react";
import { Input, Label, Textarea, Select, Button } from "@/components/ui/primitives";
import type { FormState } from "@/lib/validation";

type Action = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function VaccinationForm({
  action,
  pets,
  vaccineTypes,
  fixedPet,
}: {
  action: Action;
  pets?: { id: string; name: string; ownerName: string }[];
  vaccineTypes: { id: string; name: string }[];
  fixedPet?: { id: string; label: string };
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const errors = state.fieldErrors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fixedPet ? (
        <div className="md:col-span-2">
          <Label>Mascota</Label>
          <input type="hidden" name="petId" value={fixedPet.id} />
          <p className="text-sm font-medium text-brand-brown">{fixedPet.label}</p>
        </div>
      ) : (
        <div className="md:col-span-2">
          <Label htmlFor="petId">Mascota *</Label>
          <Select id="petId" name="petId" required defaultValue="">
            <option value="" disabled>
              Seleccioná una mascota
            </option>
            {pets?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.ownerName})
              </option>
            ))}
          </Select>
          {errors.petId && <p className="text-xs text-status-vencida mt-1">{errors.petId}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="vaccineTypeId">Vacuna *</Label>
        <Select id="vaccineTypeId" name="vaccineTypeId" required defaultValue="">
          <option value="" disabled>
            Seleccioná una vacuna
          </option>
          {vaccineTypes.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
        {errors.vaccineTypeId && <p className="text-xs text-status-vencida mt-1">{errors.vaccineTypeId}</p>}
      </div>
      <div>
        <Label htmlFor="commercialName">Nombre comercial</Label>
        <Input id="commercialName" name="commercialName" />
      </div>
      <div>
        <Label htmlFor="appliedDate">Fecha de aplicación *</Label>
        <Input id="appliedDate" name="appliedDate" type="date" required defaultValue={today} />
        {errors.appliedDate && <p className="text-xs text-status-vencida mt-1">{errors.appliedDate}</p>}
      </div>
      <div>
        <Label htmlFor="nextDate">Próxima fecha de vacunación * (manual)</Label>
        <Input id="nextDate" name="nextDate" type="date" required />
        {errors.nextDate && <p className="text-xs text-status-vencida mt-1">{errors.nextDate}</p>}
      </div>
      <div>
        <Label htmlFor="batchNumber">Número de lote</Label>
        <Input id="batchNumber" name="batchNumber" />
      </div>
      <div>
        <Label htmlFor="veterinarian">Veterinario</Label>
        <Input id="veterinarian" name="veterinarian" />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="notes">Observaciones</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>

      {state.error && <p className="md:col-span-2 text-sm text-status-vencida">{state.error}</p>}

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Registrar vacunación"}
        </Button>
      </div>
    </form>
  );
}
