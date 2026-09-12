import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { runReminderEngine } from "@/lib/reminders";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  const provided = header?.replace(/^Bearer\s+/i, "") ?? request.nextUrl.searchParams.get("secret");
  return provided === secret;
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const summary = await runReminderEngine();
  return NextResponse.json(summary);
}

export const GET = handle;
export const POST = handle;
