"use client";

import { useState } from "react";
import { Input, Label, Textarea, Button } from "@/components/ui/primitives";
import { updateTemplateAction } from "./actions";

const STAGE_LABELS: Record<string, string> = {
  DIAS_30: "30 días antes",
  DIAS_7: "7 días antes",
  DIA_1: "1 día antes",
  DIA_0: "Día de vacunación",
  VENCIDA_7: "Vencida",
};

export function TemplateEditor({
  template,
}: {
  template: {
    id: string;
    stage: string;
    name: string;
    whatsappTemplateName: string;
    content: string;
    active: boolean;
  };
}) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={async (formData) => {
        await updateTemplateAction(template.id, formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
      className="border border-brand-border rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-brand-orange-dark">
          {STAGE_LABELS[template.stage] ?? template.stage}
        </span>
        <label className="flex items-center gap-2 text-xs text-brand-brown-soft">
          <input type="checkbox" name="active" defaultChecked={template.active} className="accent-orange-500" />
          Activa
        </label>
      </div>
      <div>
        <Label htmlFor={`name-${template.id}`}>Nombre interno</Label>
        <Input id={`name-${template.id}`} name="name" defaultValue={template.name} />
      </div>
      <div>
        <Label htmlFor={`wa-${template.id}`}>Nombre de plantilla aprobada en WhatsApp</Label>
        <Input id={`wa-${template.id}`} name="whatsappTemplateName" defaultValue={template.whatsappTemplateName} />
      </div>
      <div>
        <Label htmlFor={`content-${template.id}`}>
          Contenido (variables: {"{{propietario}} {{mascota}} {{vacuna}} {{fecha_vacunacion}} {{clinica}} {{telefono_clinica}}"})
        </Label>
        <Textarea id={`content-${template.id}`} name="content" rows={5} defaultValue={template.content} />
      </div>
      <div className="flex justify-end items-center gap-2">
        {saved && <span className="text-xs text-status-al-dia">Guardado</span>}
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
