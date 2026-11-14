import { NextResponse } from "next/server";
import {
  MercadoPagoApiError,
  getOrder,
} from "@/lib/payments/mercadopago-client";
import type { PaymentStatusResult } from "@/lib/payments/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const order = await getOrder(id);

    const result: PaymentStatusResult = {
      paymentId: order.id,
      status: order.status,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch Pix payment status", error);

    const status = error instanceof MercadoPagoApiError ? 502 : 500;
    return NextResponse.json(
      { error: "Não foi possível consultar o status do pagamento." },
      { status },
    );
  }
}
