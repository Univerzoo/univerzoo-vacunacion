import { requireRole } from "@/lib/auth";
import { getClinicSettings, getReminderSettings } from "@/lib/settings";
import { PageHeader, Card, LinkButton } from "@/components/ui/primitives";
import { ClinicForm } from "./clinic-form";
import { ReminderForm } from "./reminder-form";
import { WhatsappTestButton } from "./whatsapp-test-button";

export default async function SettingsPage() {
  await requireRole(["ADMIN"]);

  const [clinic, reminders] = await Promise.all([getClinicSettings(), getReminderSettings()]);

  const whatsappConfigured = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Datos de la clínica, recordatorios, WhatsApp y plantillas"
        actions={<LinkButton href="/settings/templates" variant="secondary">Plantillas de WhatsApp</LinkButton>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Clínica</h2>
          <ClinicForm defaultValues={clinic} />
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-brand-brown mb-3">Recordatorios</h2>
          <ReminderForm defaultValues={reminders} />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-brand-brown mb-3">WhatsApp Business Platform</h2>
          <p className="text-sm text-brand-brown-soft mb-3">
            Estado: {whatsappConfigured ? (
              <span className="text-status-al-dia font-medium">Variables de entorno configuradas</span>
            ) : (
              <span className="text-status-vencida font-medium">Faltan variables de entorno</span>
            )}
          </p>
          <p className="text-xs text-brand-brown-soft mb-3">
            Configurá WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_ACCOUNT_ID y
            WHATSAPP_VERIFY_TOKEN como variables de entorno del servidor (nunca en el frontend).
          </p>
          <WhatsappTestButton />
        </Card>
      </div>
    </div>
  );
}
