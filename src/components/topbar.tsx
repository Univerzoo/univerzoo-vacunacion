"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Role } from "@/generated/prisma/enums";
import { NAV_ITEMS } from "@/components/nav-config";
import { logoutAction } from "@/lib/session-actions";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  VETERINARIO: "Veterinario",
  RECEPCION: "Recepción",
};

export function Topbar({
  name,
  role,
}: {
  name: string;
  role: Role;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-brand-border bg-brand-surface px-4 py-3 md:px-6">
      <select
        className="md:hidden rounded-lg border border-brand-border px-2 py-2 text-sm bg-brand-surface"
        onChange={(e) => router.push(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          Menú
        </option>
        {NAV_ITEMS.filter((i) => !i.roles || i.roles.includes(role)).map((i) => (
          <option key={i.href} value={i.href}>
            {i.label}
          </option>
        ))}
      </select>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar mascota, propietario, teléfono, ficha, microchip..."
          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange-light"
        />
      </form>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block leading-tight">
          <p className="text-sm font-medium text-brand-brown">{name}</p>
          <p className="text-xs text-brand-brown-soft">{ROLE_LABELS[role]}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-brown-soft hover:bg-background"
          >
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
