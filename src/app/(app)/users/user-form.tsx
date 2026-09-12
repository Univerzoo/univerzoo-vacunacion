"use client";

import { useActionState } from "react";
import { Input, Label, Select, Button } from "@/components/ui/primitives";
import { createUserAction } from "./actions";
import type { FormState } from "@/lib/validation";

const initialState: FormState = {};

export function UserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4">
      <div>
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" name="name" required />
        {errors.name && <p className="text-xs text-status-vencida mt-1">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required />
        {errors.email && <p className="text-xs text-status-vencida mt-1">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="role">Rol *</Label>
        <Select id="role" name="role" defaultValue="RECEPCION">
          <option value="ADMIN">Administrador</option>
          <option value="VETERINARIO">Veterinario</option>
          <option value="RECEPCION">Recepción</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="password">Contraseña *</Label>
        <Input id="password" name="password" type="password" required minLength={6} />
        {errors.password && <p className="text-xs text-status-vencida mt-1">{errors.password}</p>}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando..." : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
