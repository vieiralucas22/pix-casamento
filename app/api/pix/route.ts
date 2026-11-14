import { NextResponse } from "next/server";
import { couple } from "@/lib/content";
import { isValidGiftAmount } from "@/lib/payments/validate-amount";
import {
  MercadoPagoApiError,
  createPixOrder,
} from "@/lib/payments/mercadopago-client";
import type { CreatePixChargeResult } from "@/lib/payments/types";

// Mercado Pago's default Pix order expiration is 24h (P1D) when
// `expiration_time` isn't set on the request.
const EXPIRATION_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const amount = body?.amount;

  if (!isValidGiftAmount(amount)) {
    return NextResponse.json(
      { error: "Valor de presente inválido." },
      { status: 400 },
    );
  }

  try {
    const order = await createPixOrder({
      value: amount,
      description: `Presente de casamento - ${couple.first} & ${couple.second}`,
    });

    const payment = order.transactions.payments[0];
    const paymentMethod = payment?.payment_method;

    if (!paymentMethod?.qr_code || !paymentMethod.qr_code_base64) {
      throw new Error("Mercado Pago did not return Pix QR code data.");
    }

    const result: CreatePixChargeResult = {
      paymentId: order.id,
      status: order.status,
      amount: Number(order.total_amount),
      qrCodeImage: paymentMethod.qr_code_base64,
      copyPasteCode: paymentMethod.qr_code,
      expirationDate: new Date(Date.now() + EXPIRATION_MS).toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create Pix charge", error);

    const status = error instanceof MercadoPagoApiError ? 502 : 500;
    return NextResponse.json(
      { error: "Não foi possível gerar o pagamento Pix. Tente novamente." },
      { status },
    );
  }
}
