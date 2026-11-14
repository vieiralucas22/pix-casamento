import { NextResponse } from "next/server";
import { couple } from "@/lib/content";
import { isValidGiftAmount } from "@/lib/payments/validate-amount";
import {
  MercadoPagoApiError,
  createPixPayment,
} from "@/lib/payments/mercadopago-client";
import type { CreatePixChargeResult } from "@/lib/payments/types";

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
    const payment = await createPixPayment({
      value: amount,
      description: `Presente de casamento - ${couple.first} & ${couple.second}`,
    });

    const transactionData = payment.point_of_interaction?.transaction_data;

    if (!transactionData) {
      throw new Error("Mercado Pago did not return Pix QR code data.");
    }

    const result: CreatePixChargeResult = {
      paymentId: String(payment.id),
      status: payment.status,
      amount: payment.transaction_amount,
      qrCodeImage: transactionData.qr_code_base64,
      copyPasteCode: transactionData.qr_code,
      expirationDate: payment.date_of_expiration,
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
