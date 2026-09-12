"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Role } from "@/generated/prisma/enums";
import { NAV_ITEMS } from "@/components/nav-config";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r border-brand-border bg-brand-surface">
      <div className="flex items-center justify-center px-5 py-4 border-b border-brand-border">
        <Image
          src="/logo.jpeg"
          alt="UNIVERZOO Clínica Veterinaria"
          width={148}
          height={100}
        />
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role)).map(
          (item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-brand-orange-light text-brand-orange-dark"
                    : "text-brand-brown-soft hover:bg-background"
                )}
              >
                {item.label}
              </Link>
            );
          }
        )}
      </nav>
    </aside>
  );
}
