"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ from }: { from: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="from" value={from} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-brand-brown" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange-light"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          className="text-sm font-medium text-brand-brown"
          htmlFor="password"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange-light"
        />
      </div>

      {state.error && (
        <p className="text-sm text-status-vencida bg-status-vencida-bg rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
