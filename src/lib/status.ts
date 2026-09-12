import { differenceInCalendarDays, startOfDay } from "date-fns";

export type VaccinationStatus = "AL_DIA" | "PROXIMA" | "VENCE_HOY" | "VENCIDA";

export const STATUS_LABELS: Record<VaccinationStatus, string> = {
  AL_DIA: "Al día",
  PROXIMA: "Próxima",
  VENCE_HOY: "Vence hoy",
  VENCIDA: "Vencida",
};

/** Días restantes hasta la próxima vacunación (negativo si ya venció). */
export function daysUntil(nextDate: Date, today: Date = new Date()) {
  return differenceInCalendarDays(startOfDay(nextDate), startOfDay(today));
}

export function computeStatus(
  nextDate: Date,
  reminderWindowDays: number,
  today: Date = new Date()
): VaccinationStatus {
  const remaining = daysUntil(nextDate, today);

  if (remaining > reminderWindowDays) return "AL_DIA";
  if (remaining > 0) return "PROXIMA";
  if (remaining === 0) return "VENCE_HOY";
  return "VENCIDA";
}
