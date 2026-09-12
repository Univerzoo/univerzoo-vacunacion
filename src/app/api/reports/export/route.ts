import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { computeStatus, daysUntil } from "@/lib/status";
import { getReminderSettings } from "@/lib/settings";
import { toCsv } from "@/lib/csv";
import { parseDateInput } from "@/lib/dates";

export async function GET(request: NextRequest) {
  await requireUser();

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") ?? "vaccinations";

  if (type === "vaccinations") {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const vaccineTypeId = searchParams.get("vaccineTypeId") ?? undefined;
    const speciesId = searchParams.get("speciesId") ?? undefined;
    const veterinarian = searchParams.get("veterinarian") ?? undefined;

    const vaccinations = await db.vaccination.findMany({
      where: {
        vaccineTypeId: vaccineTypeId || undefined,
        veterinarian: veterinarian ? { contains: veterinarian } : undefined,
        pet: speciesId ? { speciesId } : undefined,
        appliedDate: {
          gte: from ? parseDateInput(from) : undefined,
          lte: to ? parseDateInput(to) : undefined,
        },
      },
      include: { pet: { include: { owner: true, species: true } }, vaccineType: true },
      orderBy: { appliedDate: "desc" },
    });

    const rows = vaccinations.map((v) => ({
      mascota: v.pet.name,
      especie: v.pet.species?.name ?? "",
      propietario: `${v.pet.owner.firstName} ${v.pet.owner.lastName}`,
      whatsapp: v.pet.owner.whatsapp,
      vacuna: v.vaccineType.name,
      fecha_aplicacion: format(v.appliedDate, "dd/MM/yyyy"),
      proxima_fecha: format(v.nextDate, "dd/MM/yyyy"),
      lote: v.batchNumber ?? "",
      veterinario: v.veterinarian ?? "",
      anulada: v.cancelled ? "Sí" : "No",
    }));

    return csvResponse(rows, "vacunaciones");
  }

  if (type === "vencimientos") {
    const range = searchParams.get("range") ?? "30";
    const reminderSettings = await getReminderSettings();

    const vaccinations = await db.vaccination.findMany({
      where: { cancelled: false },
      include: { pet: { include: { owner: true } }, vaccineType: true },
    });

    const withDays = vaccinations.map((v) => ({ v, remaining: daysUntil(v.nextDate) }));

    const filtered =
      range === "vencidos"
        ? withDays.filter((x) => x.remaining < 0)
        : withDays.filter((x) => x.remaining >= 0 && x.remaining <= Number(range));

    const rows = filtered.map(({ v, remaining }) => ({
      mascota: v.pet.name,
      propietario: `${v.pet.owner.firstName} ${v.pet.owner.lastName}`,
      whatsapp: v.pet.owner.whatsapp,
      vacuna: v.vaccineType.name,
      proxima_fecha: format(v.nextDate, "dd/MM/yyyy"),
      dias_restantes: remaining,
      estado: computeStatus(v.nextDate, reminderSettings.daysBefore1),
    }));

    return csvResponse(rows, "vencimientos");
  }

  if (type === "whatsapp") {
    const status = searchParams.get("status") ?? undefined;
    const messages = await db.message.findMany({
      where: status ? { status: status as never } : undefined,
      include: { owner: true, pet: true },
      orderBy: { createdAt: "desc" },
    });

    const rows = messages.map((m) => ({
      fecha: format(m.createdAt, "dd/MM/yyyy HH:mm"),
      mascota: m.pet.name,
      propietario: `${m.owner.firstName} ${m.owner.lastName}`,
      whatsapp: m.whatsappNumber,
      etapa: m.stage,
      estado: m.status,
      error: m.error ?? "",
    }));

    return csvResponse(rows, "whatsapp");
  }

  return NextResponse.json({ error: "Tipo de reporte inválido" }, { status: 400 });
}

function csvResponse(rows: Record<string, unknown>[], name: string) {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const csv = toCsv(rows, headers);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.csv"`,
    },
  });
}
