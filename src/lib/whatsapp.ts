const GRAPH_API_VERSION = "v21.0";

export type WhatsappSendResult =
  | { ok: true; externalId: string }
  | { ok: false; error: string };

function isConfigured() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
  );
}

/**
 * Envía un mensaje usando una plantilla aprobada de WhatsApp Business Platform.
 * Requiere WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID configurados como
 * variables de entorno (nunca hardcodeados ni expuestos al frontend).
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  bodyParams: string[],
  languageCode = "es"
): Promise<WhatsappSendResult> {
  if (!isConfigured()) {
    return {
      ok: false,
      error:
        "Integración de WhatsApp no configurada (faltan variables de entorno).",
    };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: "body",
              parameters: bodyParams.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        error: data?.error?.message ?? `Error HTTP ${res.status}`,
      };
    }

    const externalId = data?.messages?.[0]?.id;
    return { ok: true, externalId: externalId ?? "unknown" };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function testWhatsAppConnection(): Promise<
  { ok: true; phoneNumber: string } | { ok: false; error: string }
> {
  if (!isConfigured()) {
    return { ok: false, error: "Faltan WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID." };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}?fields=display_phone_number,verified_name`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? `Error HTTP ${res.status}` };
    }
    return { ok: true, phoneNumber: data.display_phone_number ?? "desconocido" };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export function verifyWebhookChallenge(
  mode: string | null,
  token: string | null,
  challenge: string | null
) {
  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return challenge;
  }
  return null;
}
