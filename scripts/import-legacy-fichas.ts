import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db";

type PlanVaccination = {
  vaccine_type: string;
  applied_date: string;
  next_date: string;
  estimated_next_date: boolean;
  notes: string | null;
};

type PlanPet = {
  source_folder: string;
  name: string;
  species: string | null;
  species_raw: string | null;
  sex: "MACHO" | "HEMBRA" | null;
  breed: string | null;
  color: string | null;
  birth_date: string | null;
  file_number: string | null;
  notes: string | null;
  vaccinations: PlanVaccination[];
};

type PlanOwner = {
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  pets: PlanPet[];
};

const DRY_RUN = process.argv.includes("--dry-run");
const PLAN_PATH = process.argv[2]?.startsWith("--") ? "import_plan.json" : process.argv[2] ?? "import_plan.json";

function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();

  const intlMatch = trimmed.match(/\+\d{7,15}/);
  if (intlMatch && /^\+[1-9]\d{6,14}$/.test(intlMatch[0])) return intlMatch[0];

  const m = trimmed.match(/0?9\d{2}[-.\s]?\d{3}[-.\s]?\d{3,4}/);
  if (!m) return null;
  const digits = m[0].replace(/\D/g, "");
  let local = digits;
  if (local.length === 10 && local.startsWith("0")) local = local.slice(1);
  if (local.length !== 9) return null;
  const candidate = `+595${local}`;
  return /^\+[1-9]\d{6,14}$/.test(candidate) ? candidate : null;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

async function main() {
  const plan: { owners: PlanOwner[] } = JSON.parse(fs.readFileSync(path.resolve(PLAN_PATH), "utf-8"));

  const speciesCache = new Map<string, string>();
  for (const s of await db.species.findMany()) speciesCache.set(s.name, s.id);

  const vaccineTypeNames = new Set<string>();
  for (const owner of plan.owners) {
    for (const pet of owner.pets) {
      for (const v of pet.vaccinations) vaccineTypeNames.add(v.vaccine_type);
    }
  }

  const vaccineTypeCache = new Map<string, string>();
  for (const name of vaccineTypeNames) {
    const existing = await db.vaccineType.findFirst({ where: { name } });
    if (existing) {
      vaccineTypeCache.set(name, existing.id);
      continue;
    }
    if (DRY_RUN) {
      vaccineTypeCache.set(name, `DRY-${name}`);
      continue;
    }
    const created = await db.vaccineType.create({
      data: { name, description: "Importada desde fichas históricas" },
    });
    vaccineTypeCache.set(name, created.id);
  }

  const summary = {
    ownersCreated: 0,
    ownersReused: 0,
    ownersSkippedInvalidPhone: 0,
    petsCreated: 0,
    vaccinationsCreated: 0,
    skippedOwners: [] as { name: string; phone: string }[],
  };

  const mapping: Record<string, { ownerId: string; petId: string }> = {};

  for (const owner of plan.owners) {
    const whatsapp = normalizePhone(owner.phone);
    if (!whatsapp) {
      summary.ownersSkippedInvalidPhone += 1;
      summary.skippedOwners.push({ name: owner.name, phone: owner.phone });
      continue;
    }

    const { firstName, lastName } = splitName(owner.name);

    let ownerRecord = await db.owner.findFirst({ where: { whatsapp } });
    if (ownerRecord) {
      summary.ownersReused += 1;
    } else {
      summary.ownersCreated += 1;
      if (!DRY_RUN) {
        ownerRecord = await db.owner.create({
          data: {
            firstName,
            lastName,
            whatsapp,
            phone: whatsapp,
            email: owner.email,
            address: owner.address,
            notes: owner.notes,
          },
        });
      }
    }

    for (const pet of owner.pets) {
      summary.petsCreated += 1;
      let petId = "DRY-PET";
      if (!DRY_RUN && ownerRecord) {
        const petRecord = await db.pet.create({
          data: {
            ownerId: ownerRecord.id,
            name: pet.name,
            speciesId: pet.species ? speciesCache.get(pet.species) ?? null : null,
            breed: pet.breed,
            sex: pet.sex ?? undefined,
            birthDate: pet.birth_date ? new Date(pet.birth_date) : null,
            fileNumber: pet.file_number,
            notes: pet.notes,
          },
        });
        petId = petRecord.id;

        for (const v of pet.vaccinations) {
          await db.vaccination.create({
            data: {
              petId: petRecord.id,
              vaccineTypeId: vaccineTypeCache.get(v.vaccine_type)!,
              appliedDate: new Date(v.applied_date),
              nextDate: new Date(v.next_date),
              notes: v.notes,
            },
          });
          summary.vaccinationsCreated += 1;
        }
      } else {
        summary.vaccinationsCreated += pet.vaccinations.length;
      }

      mapping[pet.source_folder] = { ownerId: ownerRecord?.id ?? "DRY", petId };
    }
  }

  console.log(JSON.stringify({ dryRun: DRY_RUN, ...summary, vaccineTypesInPlan: vaccineTypeNames.size }, null, 1));

  if (!DRY_RUN) {
    fs.writeFileSync("import-report-mapping.json", JSON.stringify(mapping, null, 1));
    console.log("Mapeo carpeta -> IDs creados guardado en import-report-mapping.json");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
