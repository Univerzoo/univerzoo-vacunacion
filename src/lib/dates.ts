import { format } from "date-fns";

/** Parsea un input <input type="date"> (YYYY-MM-DD) como fecha local, evitando
 * el corrimiento de un día que ocurre al interpretarlo como UTC con `new Date(string)`. */
export function parseDateInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** Formatea una fecha para usar como defaultValue de <input type="date">, en hora local. */
export function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
