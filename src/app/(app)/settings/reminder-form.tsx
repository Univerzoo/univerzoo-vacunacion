"use client";

import { useActionState } from "react";
import { Input, Label, Button } from "@/components/ui/primitives";
import { updateReminderSettingsAction } from "./actions";

export function ReminderForm({
  defaultValues,
}: {
  defaultValues: {
    daysBefore1: number;
    daysBefore2: number;
    daysBefore3: number;
    dayOf: number;
    daysAfter: number;
    retryOnError: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(updateReminderSettingsAction, {});

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="daysBefore1">Primer recordatorio (días antes)</Label>
        <Input id="daysBefore1" name="daysBefore1" type="number" min={0} defaultValue={defaultValues.daysBefore1} />
      </div>
      <div>
        <Label htmlFor="daysBefore2">Segundo recordatorio (días antes)</Label>
        <Input id="daysBefore2" name="daysBefore2" type="number" min={0} defaultValue={defaultValues.daysBefore2} />
      </div>
      <div>
        <Label htmlFor="daysBefore3">Tercer recordatorio (días antes)</Label>
        <Input id="daysBefore3" name="daysBefore3" type="number" min={0} defaultValue={defaultValues.daysBefore3} />
      </div>
      <div>
        <Label htmlFor="dayOf">Recordatorio del día</Label>
        <Input id="dayOf" name="dayOf" type="number" min={0} defaultValue={defaultValues.dayOf} />
      </div>
      <div>
        <Label htmlFor="daysAfter">Recordatorio posterior (días después de vencida)</Label>
        <Input id="daysAfter" name="daysAfter" type="number" min={0} defaultValue={defaultValues.daysAfter} />
      </div>
      <div className="flex items-center gap-2 mt-6">
        <input
          id="retryOnError"
          name="retryOnError"
          type="checkbox"
          defaultChecked={defaultValues.retryOnError}
          className="h-4 w-4 rounded border-brand-border accent-orange-500"
        />
        <Label htmlFor="retryOnError" className="mb-0">
          Permitir reintentar mensajes con error
        </Label>
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
