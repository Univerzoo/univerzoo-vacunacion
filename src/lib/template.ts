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
