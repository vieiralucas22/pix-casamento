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

type MercadoPagoOrderPayment = {
  id: string;
  status: string;
  status_detail: string;
  amount: string;
  payment_method: {
    id: string;
    type: string;
    qr_code?: string;
    qr_code_base64?: string;
  };
};

type MercadoPagoOrderResponse = {
  id: string;
  status: string;
  status_detail: string;
  total_amount: string;
  transactions: {
    payments: MercadoPagoOrderPayment[];
  };
};

// The Payments API (/v1/payments) rejects newer-style access tokens with
// "Unauthorized use of live credentials" — those accounts must use the
// Orders API (/v1/orders) instead, which is what this client targets.
export async function createPixOrder(params: {
  value: number;
  description: string;
  externalReference?: string;
}) {
  const { payerEmail, payerCpf } = getConfig();
  const amount = params.value.toFixed(2);

  return mercadoPagoFetch<MercadoPagoOrderResponse>("/v1/orders", {
    method: "POST",
    headers: {
      "X-Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      type: "online",
      total_amount: amount,
      // Required by the Orders API even though the docs list it as optional.
      external_reference: params.externalReference ?? randomUUID(),
      processing_mode: "automatic",
      description: params.description,
      payer: {
        email: payerEmail,
        identification: {
          type: "CPF",
          number: payerCpf,
        },
      },
      transactions: {
        payments: [
          {
            amount,
            payment_method: {
              id: "pix",
              type: "bank_transfer",
            },
          },
        ],
      },
    }),
  });
}

export async function getOrder(orderId: string) {
  return mercadoPagoFetch<MercadoPagoOrderResponse>(`/v1/orders/${orderId}`);
}
