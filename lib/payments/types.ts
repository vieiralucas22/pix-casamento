export type MercadoPagoPaymentStatus =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back"
  | string;

export type CreatePixChargeResult = {
  paymentId: string;
  status: MercadoPagoPaymentStatus;
  amount: number;
  qrCodeImage: string;
  copyPasteCode: string;
  expirationDate: string;
};

export type PaymentStatusResult = {
  paymentId: string;
  status: MercadoPagoPaymentStatus;
};
