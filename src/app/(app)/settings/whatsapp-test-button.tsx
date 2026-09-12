"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/primitives";
import { testWhatsappConnectionAction } from "./actions";

export function WhatsappTestButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function handleTest() {
    startTransition(async () => {
      const res = await testWhatsappConnectionAction();
      if (res.ok) {
        setResult({ ok: true, message: `Conectado. Número: ${res.phoneNumber}` });
      } else {
        setResult({ ok: false, message: res.error });
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 items-start">
      <Button type="button" variant="secondary" onClick={handleTest} disabled={pending}>
        {pending ? "Probando..." : "Probar conexión"}
      </Button>
      {result && (
        <p className={result.ok ? "text-sm text-status-al-dia" : "text-sm text-status-vencida"}>
          {result.message}
        </p>
      )}
    </div>
  );
}
