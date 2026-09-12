"use client";

import { useActionState } from "react";
import { Input, Label, Textarea, Select, Button } from "@/components/ui/primitives";
import { toDateInputValue } from "@/lib/dates";
import type { FormState } from "@/lib/validation";

type PetFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function PetForm({
  action,
  species,
  owners,
  fixedOwner,
  defaultValues,
}: {
  action: PetFormAction;
  species: { id: string; name: string }[];
  owners?: { id: string; firstName: string; lastName: string }[];
  fixedOwner?: { id: string; name: string };
  defaultValues?: {
    name: string;
    speciesId: string | null;
    breed: string | null;
    sex: string | null;
    birthDate: Date | null;
    color: string | null;
    weight: number | null;
    fileNumber: string | null;
    microchip: string | null;
    notes: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fixedOwner ? (
        <div className="md:col-span-2">
          <Label>Propietario</Label>
          <input type="hidden" name="ownerId" value={fixedOwner.id} />
          <p className="text-sm font-medium text-brand-brown">{fixedOwner.name}</p>
        </div>
      ) : (
        <div className="md:col-span-2">
          <Label htmlFor="ownerId">Propietario *</Label>
          <Select id="ownerId" name="ownerId" required defaultValue="">
            <option value="" disabled>
              Seleccioná un propietario
            </option>
            {owners?.map((o) => (
              <option key={o.id} value={o.id}>
                {o.firstName} {o.lastName}
              </option>
            ))}
          </Select>
          {errors.ownerId && <p className="text-xs text-status-vencida mt-1">{errors.ownerId}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" name="name" required defaultValue={defaultValues?.name} />
        {errors.name && <p className="text-xs text-status-vencida mt-1">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="speciesId">Especie</Label>
        <Select id="speciesId" name="speciesId" defaultValue={defaultValues?.speciesId ?? ""}>
          <option value="">Sin especificar</option>
          {species.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="breed">Raza</Label>
        <Input id="breed" name="breed" defaultValue={defaultValues?.breed ?? ""} />
      </div>
      <div>
        <Label htmlFor="sex">Sexo</Label>
        <Select id="sex" name="sex" defaultValue={defaultValues?.sex ?? ""}>
          <option value="">Sin especificar</option>
          <option value="MACHO">Macho</option>
          <option value="HEMBRA">Hembra</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="birthDate">Fecha de nacimiento</Label>
        <Input
          id="birthDate"
          name="birthDate"
          type="date"
          defaultValue={defaultValues?.birthDate ? toDateInputValue(defaultValues.birthDate) : ""}
        />
      </div>
      <div>
        <Label htmlFor="color">Color</Label>
        <Input id="color" name="color" defaultValue={defaultValues?.color ?? ""} />
      </div>
      <div>
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input
          id="weight"
          name="weight"
          type="number"
          step="0.1"
          defaultValue={defaultValues?.weight ?? ""}
        />
      </div>
      <div>
        <Label htmlFor="fileNumber">Número de ficha</Label>
        <Input id="fileNumber" name="fileNumber" defaultValue={defaultValues?.fileNumber ?? ""} />
      </div>
      <div>
        <Label htmlFor="microchip">Microchip</Label>
        <Input id="microchip" name="microchip" defaultValue={defaultValues?.microchip ?? ""} />
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
