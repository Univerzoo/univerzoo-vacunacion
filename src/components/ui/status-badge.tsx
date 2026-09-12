import clsx from "clsx";
import type { VaccinationStatus } from "@/lib/status";
import { STATUS_LABELS } from "@/lib/status";

const STYLES: Record<VaccinationStatus, string> = {
  AL_DIA: "bg-status-al-dia-bg text-status-al-dia",
  PROXIMA: "bg-status-proxima-bg text-status-proxima",
  VENCE_HOY: "bg-status-vence-hoy-bg text-status-vence-hoy",
  VENCIDA: "bg-status-vencida-bg text-status-vencida",
};

export function StatusBadge({ status }: { status: VaccinationStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

const MESSAGE_STYLES: Record<string, string> = {
  PENDIENTE: "bg-brand-border text-brand-brown-soft",
  ENVIADO: "bg-status-proxima-bg text-status-proxima",
  ENTREGADO: "bg-status-al-dia-bg text-status-al-dia",
  LEIDO: "bg-brand-orange-light text-brand-orange-dark",
  ERROR: "bg-status-vencida-bg text-status-vencida",
};

const MESSAGE_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  LEIDO: "Leído",
  ERROR: "Error",
};

export function MessageStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        MESSAGE_STYLES[status] ?? "bg-brand-border text-brand-brown-soft"
      )}
    >
      {MESSAGE_LABELS[status] ?? status}
    </span>
  );
}
