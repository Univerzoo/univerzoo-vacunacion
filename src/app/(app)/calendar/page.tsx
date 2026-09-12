import Link from "next/link";
import clsx from "clsx";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/lib/db";
import { computeStatus } from "@/lib/status";
import { getReminderSettings } from "@/lib/settings";
import { PageHeader, Card, LinkButton, EmptyState } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/ui/status-badge";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const params = await searchParams;
  const monthParam = typeof params.month === "string" ? params.month : null;
  const dayParam = typeof params.day === "string" ? params.day : null;

  const anchor = monthParam ? parseISO(`${monthParam}-01`) : new Date();
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const [reminderSettings, vaccinations] = await Promise.all([
    getReminderSettings(),
    db.vaccination.findMany({
      where: { cancelled: false, nextDate: { gte: gridStart, lte: gridEnd } },
      include: { pet: { include: { owner: true } }, vaccineType: true },
    }),
  ]);

  const byDay = new Map<string, typeof vaccinations>();
  for (const v of vaccinations) {
    const key = format(v.nextDate, "yyyy-MM-dd");
    const list = byDay.get(key) ?? [];
    list.push(v);
    byDay.set(key, list);
  }

  const prevMonth = format(subMonths(monthStart, 1), "yyyy-MM");
  const nextMonth = format(addMonths(monthStart, 1), "yyyy-MM");
  const selectedDay = dayParam ? byDay.get(dayParam) ?? [] : [];

  return (
    <div>
      <PageHeader
        title="Calendario de vacunaciones"
        description={format(monthStart, "MMMM yyyy", { locale: es })}
        actions={
          <>
            <LinkButton href={`/calendar?month=${prevMonth}`} variant="ghost">
              ← Anterior
            </LinkButton>
            <LinkButton href={`/calendar?month=${nextMonth}`} variant="ghost">
              Siguiente →
            </LinkButton>
          </>
        }
      />

      <Card className="mb-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-brand-brown-soft">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const items = byDay.get(key) ?? [];
            const inMonth = isSameMonth(day, monthStart);
            return (
              <Link
                key={key}
                href={`/calendar?month=${format(monthStart, "yyyy-MM")}&day=${key}`}
                className={clsx(
                  "min-h-20 rounded-lg border p-2 text-left transition",
                  inMonth ? "border-brand-border bg-brand-surface" : "border-transparent bg-background text-brand-brown-soft/50",
                  isToday(day) && "ring-2 ring-brand-orange",
                  dayParam === key && "border-brand-orange"
                )}
              >
                <span className="text-xs font-medium">{format(day, "d")}</span>
                {items.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 2).map((v) => (
                      <div
                        key={v.id}
                        className="truncate rounded bg-brand-orange-light px-1.5 py-0.5 text-[10px] text-brand-orange-dark"
                      >
                        {v.pet.name}
                      </div>
                    ))}
                    {items.length > 2 && (
                      <div className="text-[10px] text-brand-brown-soft">+{items.length - 2} más</div>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </Card>

      {dayParam && (
        <Card className="overflow-x-auto">
          <h2 className="text-sm font-semibold text-brand-brown mb-3">
            Vacunaciones del {format(parseISO(dayParam), "dd/MM/yyyy")}
          </h2>
          {selectedDay.length === 0 ? (
            <EmptyState message="No hay vacunaciones programadas para este día." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-brand-brown-soft border-b border-brand-border">
                  <th className="py-2 pr-3">Mascota</th>
                  <th className="py-2 pr-3">Propietario</th>
                  <th className="py-2 pr-3">Vacuna</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {selectedDay.map((v) => (
                  <tr key={v.id} className="border-b border-brand-border last:border-0">
                    <td className="py-2 pr-3 font-medium text-brand-brown">{v.pet.name}</td>
                    <td className="py-2 pr-3">
                      {v.pet.owner.firstName} {v.pet.owner.lastName}
                    </td>
                    <td className="py-2 pr-3">{v.vaccineType.name}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={computeStatus(v.nextDate, reminderSettings.daysBefore1)} />
                    </td>
                    <td className="py-2 pr-3">
                      <Link href={`/pets/${v.petId}`} className="text-brand-orange-dark font-medium hover:underline">
                        Ver ficha
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
