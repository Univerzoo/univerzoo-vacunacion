export type TemplateVars = {
  propietario: string;
  mascota: string;
  vacuna: string;
  fecha_vacunacion: string;
  clinica: string;
  telefono_clinica: string;
};

export function renderTemplate(content: string, vars: TemplateVars) {
  return content.replace(/{{\s*(\w+)\s*}}/g, (match, key: string) => {
    return key in vars ? vars[key as keyof TemplateVars] : match;
  });
}

/**
 * Orden fijo de parámetros posicionales ({{1}}..{{5}}) que se envían al
 * cuerpo de la plantilla aprobada en WhatsApp Business Manager. Debe
 * coincidir exactamente con el orden de {{n}} usado al crear la plantilla
 * en Meta, y usarse siempre desde este único lugar (motor de recordatorios
 * y reintento manual) para que nunca queden desincronizados.
 */
export function buildWhatsAppTemplateParams(vars: {
  ownerName: string;
  petName: string;
  vaccineName: string;
  nextDate: string;
  clinicName: string;
}): string[] {
  return [vars.ownerName, vars.petName, vars.vaccineName, vars.nextDate, vars.clinicName];
}
