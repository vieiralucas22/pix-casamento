export type MercadoPagoOrderStatus =
  | "created"
  | "processing"
  | "processed"
  | "action_required"
  | "refunded"
  | "canceled"
  | "failed"
  | string;

export type CreatePixChargeResult = {
  paymentId: string;
  status: MercadoPagoOrderStatus;
  amount: number;
  qrCodeImage: string;
  copyPasteCode: string;
  expirationDate: string;
};

export type PaymentStatusResult = {
  paymentId: string;
  status: MercadoPagoOrderStatus;
};
