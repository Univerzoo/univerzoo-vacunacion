import { db } from "@/lib/db";
import { computeStatus, daysUntil } from "@/lib/status";
import { getReminderSettings } from "@/lib/settings";

export async function getDashboardData() {
  const [reminderSettings, totalOwners, totalPets, sentMessages, pendingMessages, errorMessages, activeVaccinations] =
    await Promise.all([
      getReminderSettings(),
      db.owner.count({ where: { active: true } }),
      db.pet.count({ where: { active: true } }),
      db.message.count({ where: { status: { in: ["ENVIADO", "ENTREGADO", "LEIDO"] } } }),
      db.message.count({ where: { status: "PENDIENTE" } }),
      db.message.count({ where: { status: "ERROR" } }),
      db.vaccination.findMany({
        where: { cancelled: false },
        include: { pet: { include: { owner: true } }, vaccineType: true },
        orderBy: { nextDate: "asc" },
      }),
    ]);

  const windowDays = reminderSettings.daysBefore1;
  const withStatus = activeVaccinations.map((v) => ({
    ...v,
    status: computeStatus(v.nextDate, windowDays),
    remaining: daysUntil(v.nextDate),
  }));

  const counts = {
    alDia: withStatus.filter((v) => v.status === "AL_DIA").length,
    proxima: withStatus.filter((v) => v.status === "PROXIMA").length,
    venceHoy: withStatus.filter((v) => v.status === "VENCE_HOY").length,
    vencida: withStatus.filter((v) => v.status === "VENCIDA").length,
  };

  const proximas = withStatus
    .filter((v) => v.status === "PROXIMA" || v.status === "VENCE_HOY")
    .slice(0, 10);

  return {
    totalOwners,
    totalPets,
    sentMessages,
    pendingMessages,
    errorMessages,
    counts,
    proximas,
  };
}
