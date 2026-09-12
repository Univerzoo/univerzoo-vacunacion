import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/primitives";
import { TemplateEditor } from "./template-editor";

const STAGE_ORDER = ["DIAS_30", "DIAS_7", "DIA_1", "DIA_0", "VENCIDA_7"];

export default async function TemplatesPage() {
  await requireRole(["ADMIN"]);

  const templates = await db.messageTemplate.findMany();
  const sorted = [...templates].sort((a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage));

  return (
    <div>
      <PageHeader
        title="Plantillas de WhatsApp"
        description="Un mensaje por cada etapa del recordatorio. El nombre de plantilla debe coincidir con una plantilla aprobada en WhatsApp Business Manager."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((t) => (
          <TemplateEditor key={t.id} template={t} />
        ))}
      </div>
    </div>
  );
}
