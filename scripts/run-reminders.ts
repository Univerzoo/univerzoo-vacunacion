import "dotenv/config";
import { runReminderEngine } from "../src/lib/reminders";

/**
 * Ejecuta el motor de recordatorios como proceso independiente.
 * Pensado para ser invocado por un scheduler del sistema operativo
 * (cron en Linux, Programador de tareas en Windows), NO depende de
 * que la aplicación web esté abierta.
 *
 * Uso:
 *   npm run reminders:run
 */
async function main() {
  const summary = await runReminderEngine();
  console.log(
    `[reminders] revisadas=${summary.checked} creadas=${summary.created} enviadas=${summary.sent} fallidas=${summary.failed}`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("[reminders] error ejecutando el motor de recordatorios", err);
  process.exit(1);
});
