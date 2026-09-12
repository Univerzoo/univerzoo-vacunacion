import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookChallenge } from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const challenge = verifyWebhookChallenge(
    searchParams.get("hub.mode"),
    searchParams.get("hub.verify_token"),
    searchParams.get("hub.challenge")
  );

  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  await db.whatsappEvent.create({
    data: { payload: JSON.stringify(payload ?? {}) },
  });

  try {
    const entry = payload?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (message?.from && message?.text?.body) {
      const from = `+${message.from}`;
      const body = String(message.text.body).trim();

      const lastMessage = await db.message.findFirst({
        where: { whatsappNumber: from },
        orderBy: { createdAt: "desc" },
      });

      if (lastMessage) {
        await db.message.update({
          where: { id: lastMessage.id },
          data: { response: body },
        });
      }
    }
  } catch {
    // El evento ya quedó registrado en whatsapp_events para revisión manual.
  }

  return NextResponse.json({ received: true });
}
