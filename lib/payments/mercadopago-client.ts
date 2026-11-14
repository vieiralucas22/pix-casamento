import "server-only";
import { randomUUID } from "crypto";

export class MercadoPagoApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
    this.name = "MercadoPagoApiError";
  }
}

const API_BASE_URL = "https://api.mercadopago.com";

function getConfig() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const payerEmail = process.env.MERCADOPAGO_PAYER_EMAIL;
  const payerCpf = process.env.MERCADOPAGO_PAYER_CPF;

  if (!accessToken || !payerEmail || !payerCpf) {
    throw new Error(
      "Missing Mercado Pago configuration. Set MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_PAYER_EMAIL and MERCADOPAGO_PAYER_CPF.",
    );
  }

  return { accessToken, payerEmail, payerCpf };
}

async function mercadoPagoFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { accessToken } = getConfig();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new MercadoPagoApiError(
      `Mercado Pago request to ${path} failed with status ${response.status}`,
      response.status,
      body,
    );
  }

  return body as T;
}

type MercadoPagoPaymentResponse = {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  date_of_expiration: string;
  point_of_interaction?: {
    transaction_data: {
      qr_code: string;
      qr_code_base64: string;
    };
  };
};

export async function createPixPayment(params: {
  value: number;
  description: string;
  externalReference?: string;
}) {
  const { payerEmail, payerCpf } = getConfig();

  return mercadoPagoFetch<MercadoPagoPaymentResponse>("/v1/payments", {
    method: "POST",
    headers: {
      "X-Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      transaction_amount: params.value,
      payment_method_id: "pix",
      description: params.description,
      external_reference: params.externalReference,
      payer: {
        email: payerEmail,
        identification: {
          type: "CPF",
          number: payerCpf,
        },
      },
    }),
  });
}

export async function getPayment(paymentId: string) {
  return mercadoPagoFetch<MercadoPagoPaymentResponse>(
    `/v1/payments/${paymentId}`,
  );
}
