import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

// Module-scope dedupe cache. Resets on cold start and isn't shared across
// serverless instances — acceptable for low-traffic webhook delivery, but
// swap for a durable store (KV/DB) before relying on it at higher volume.
const seenNotificationIds = new Set<string>();
const MAX_SEEN_EVENTS = 500;

function parseSignatureHeader(header: string | null) {
  if (!header) return null;

  const parts = Object.fromEntries(
    header.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    }),
  );

  if (!parts.ts || !parts.v1) return null;
  return { ts: parts.ts, v1: parts.v1 };
}

function isAuthentic(request: Request, dataId: string | null) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const signature = parseSignatureHeader(request.headers.get("x-signature"));
  const requestId = request.headers.get("x-request-id");

  if (!secret || !signature) return false;

  const manifestParts = [
    dataId ? `id:${dataId.toLowerCase()};` : "",
    requestId ? `request-id:${requestId};` : "",
    `ts:${signature.ts};`,
  ];
  const manifest = manifestParts.join("");

  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature.v1);

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id");

  if (!isAuthentic(request, dataId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notification = await request.json().catch(() => null);

  if (!notification?.id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const notificationId = String(notification.id);

  if (seenNotificationIds.has(notificationId)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (seenNotificationIds.size >= MAX_SEEN_EVENTS) {
    seenNotificationIds.clear();
  }
  seenNotificationIds.add(notificationId);

  console.log("Mercado Pago webhook event", {
    id: notificationId,
    type: notification.type,
    action: notification.action,
    paymentId: notification.data?.id,
  });

  return NextResponse.json({ received: true });
}
