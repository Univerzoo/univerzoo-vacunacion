import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Card, Input, Button } from "@/components/ui/primitives";
import { UserForm } from "./user-form";
import { toggleUserActiveAction, resetPasswordAction } from "./actions";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  VETERINARIO: "Veterinario",
  RECEPCION: "Recepción",
};

export default async function UsersPage() {
  await requireRole(["ADMIN"]);
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader title="Usuarios" description="Gestión de usuarios y permisos" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Nuevo usuario</h2>
          <UserForm />
        </Card>

        <Card className="lg:col-span-2 overflow-x-auto">
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Usuarios</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                <th className="py-2 pr-3">Nombre</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Rol</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3">Restablecer contraseña</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const toggle = toggleUserActiveAction.bind(null, u.id, !u.active);
                const reset = resetPasswordAction.bind(null, u.id);
                return (
                  <tr key={u.id} className="border-b border-brand-border last:border-0 align-top">
                    <td className="py-2 pr-3 font-medium text-brand-brown">{u.name}</td>
                    <td className="py-2 pr-3">{u.email}</td>
                    <td className="py-2 pr-3">{ROLE_LABELS[u.role]}</td>
                    <td className="py-2 pr-3">
                      {u.active ? (
                        <span className="text-status-al-dia text-xs font-medium">Activo</span>
                      ) : (
                        <span className="text-brand-brown-soft text-xs font-medium">Inactivo</span>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <form action={reset} className="flex gap-2">
                        <Input name="password" type="password" placeholder="Nueva contraseña" className="w-36" minLength={6} />
                        <Button type="submit" variant="ghost" className="px-2 py-1 text-xs">
                          Restablecer
                        </Button>
                      </form>
                    </td>
                    <td className="py-2 pr-3">
                      <form action={toggle}>
                        <Button type="submit" variant="ghost" className="px-2 py-1 text-xs">
                          {u.active ? "Desactivar" : "Activar"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
