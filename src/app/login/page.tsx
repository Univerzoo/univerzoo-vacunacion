import Image from "next/image";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Image
            src="/logo.jpeg"
            alt="UNIVERZOO Clínica Veterinaria"
            width={236}
            height={160}
            priority
          />
        </div>
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-brand-brown mb-1">
            Iniciar sesión
          </h1>
          <p className="text-sm text-brand-brown-soft mb-6">
            Sistema de recordatorios de vacunación
          </p>
          <LoginForm from={from} />
        </div>
      </div>
    </div>
  );
}
