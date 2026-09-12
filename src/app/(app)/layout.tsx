import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar role={session.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar name={session.name} role={session.role} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
