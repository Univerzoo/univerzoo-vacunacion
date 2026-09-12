import type { Role } from "@/generated/prisma/enums";

export type NavItem = {
  href: string;
  label: string;
  roles?: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/owners", label: "Propietarios" },
  { href: "/pets", label: "Mascotas" },
  { href: "/vaccinations", label: "Vacunaciones" },
  { href: "/calendar", label: "Calendario" },
  { href: "/messages", label: "Mensajes" },
  { href: "/reports", label: "Reportes" },
  { href: "/vaccines", label: "Vacunas", roles: ["ADMIN"] },
  { href: "/users", label: "Usuarios", roles: ["ADMIN"] },
  { href: "/audit", label: "Auditoría", roles: ["ADMIN"] },
  { href: "/settings", label: "Configuración", roles: ["ADMIN"] },
];
