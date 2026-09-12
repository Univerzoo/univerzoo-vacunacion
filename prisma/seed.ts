import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding base de datos...");

  await db.clinicSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: process.env.CLINIC_NAME || "UNIVERZOO Clínica Veterinaria",
      phone: process.env.CLINIC_PHONE || "+595981000000",
      whatsapp: process.env.CLINIC_WHATSAPP || "+595981000000",
      address: "Av. España 123, Asunción",
      email: "contacto@univerzoo.com",
      logoUrl: "/logo.jpeg",
    },
  });

  await db.reminderSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const adminEmail = "admin@univerzoo.com";
  const adminPassword = "Univerzoo2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  const speciesNames = ["Perro", "Gato", "Ave", "Conejo", "Otro"];
  const species = new Map<string, string>();
  for (const name of speciesNames) {
    const s = await db.species.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    species.set(name, s.id);
  }

  const vaccineDefs = [
    { name: "Antirrábica", species: null, description: "Vacuna antirrábica anual" },
    { name: "Triple felina", species: "Gato", description: "Panleucopenia, rinotraqueítis y calicivirus" },
    { name: "Quíntuple", species: "Perro", description: "Vacuna quíntuple canina" },
    { name: "Séxtuple", species: "Perro", description: "Vacuna séxtuple canina" },
    { name: "Leptospirosis", species: "Perro", description: "Leptospirosis canina" },
    { name: "Bordetella", species: "Perro", description: "Tos de las perreras" },
  ];
  const vaccineTypes = new Map<string, string>();
  for (const v of vaccineDefs) {
    const vt = await db.vaccineType.upsert({
      where: { id: `seed-${v.name}` },
      update: {},
      create: {
        id: `seed-${v.name}`,
        name: v.name,
        description: v.description,
        speciesId: v.species ? species.get(v.species) : null,
      },
    });
    vaccineTypes.set(v.name, vt.id);
  }

  const templateDefs: {
    stage: "DIAS_30" | "DIAS_7" | "DIA_1" | "DIA_0" | "VENCIDA_7";
    name: string;
    whatsappTemplateName: string;
    content: string;
  }[] = [
    {
      stage: "DIAS_30",
      name: "30 días antes",
      whatsappTemplateName: "recordatorio_30_dias",
      content:
        "Hola {{propietario}} 👋\n\nTe recordamos que {{mascota}} tiene programada su vacunación de {{vacuna}} para el día {{fecha_vacunacion}} (en 30 días).\n\nComunícate con {{clinica}} para coordinar su turno.\n\n¡Gracias!",
    },
    {
      stage: "DIAS_7",
      name: "7 días antes",
      whatsappTemplateName: "recordatorio_7_dias",
      content:
        "Hola {{propietario}} 👋\n\nEn 7 días, el {{fecha_vacunacion}}, corresponde la vacunación de {{vacuna}} de {{mascota}}.\n\nComunícate con {{clinica}} ({{telefono_clinica}}) para coordinar su turno.",
    },
    {
      stage: "DIA_1",
      name: "1 día antes",
      whatsappTemplateName: "recordatorio_1_dia",
      content:
        "Hola {{propietario}} 👋\n\nMañana {{fecha_vacunacion}} corresponde la vacunación de {{vacuna}} de {{mascota}}. ¡Te esperamos en {{clinica}}!",
    },
    {
      stage: "DIA_0",
      name: "Día de vacunación",
      whatsappTemplateName: "recordatorio_dia",
      content:
        "Hola {{propietario}} 👋\n\nHoy {{fecha_vacunacion}} corresponde la vacunación de {{vacuna}} de {{mascota}}. Comunícate con {{clinica}} ({{telefono_clinica}}) para coordinar el turno.",
    },
    {
      stage: "VENCIDA_7",
      name: "Vencida (7 días después)",
      whatsappTemplateName: "recordatorio_vencida",
      content:
        "Hola {{propietario}} 👋\n\nLa vacunación de {{vacuna}} de {{mascota}}, programada para el {{fecha_vacunacion}}, se encuentra vencida. Por favor comunícate con {{clinica}} ({{telefono_clinica}}) para regularizarla.",
    },
  ];
  for (const t of templateDefs) {
    await db.messageTemplate.upsert({
      where: { stage: t.stage },
      update: {},
      create: t,
    });
  }

  const owner = await db.owner.upsert({
    where: { id: "seed-owner-juan" },
    update: {},
    create: {
      id: "seed-owner-juan",
      firstName: "Juan",
      lastName: "Pérez",
      whatsapp: "+595981123456",
      phone: "+595981123456",
      email: "juan.perez@example.com",
      city: "Asunción",
    },
  });

  const pet = await db.pet.upsert({
    where: { id: "seed-pet-luna" },
    update: {},
    create: {
      id: "seed-pet-luna",
      ownerId: owner.id,
      name: "Luna",
      speciesId: species.get("Perro"),
      breed: "Mestiza",
      sex: "HEMBRA",
      fileNumber: "F-0001",
    },
  });

  const today = new Date();
  const demoVaccinations = [
    { id: "seed-vacc-1", offset: 45 },
    { id: "seed-vacc-2", offset: 20 },
    { id: "seed-vacc-3", offset: 0 },
    { id: "seed-vacc-4", offset: -10 },
  ];
  for (const v of demoVaccinations) {
    await db.vaccination.upsert({
      where: { id: v.id },
      update: {},
      create: {
        id: v.id,
        petId: pet.id,
        vaccineTypeId: vaccineTypes.get("Antirrábica")!,
        appliedDate: addDays(today, v.offset - 365),
        nextDate: addDays(today, v.offset),
        veterinarian: "Dra. Gómez",
      },
    });
  }

  console.log("Seed completo.");
  console.log(`Usuario admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
