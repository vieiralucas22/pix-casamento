export const couple = {
  first: "Lucas",
  second: "Maiza",
};

export const siteContent = {
  heroEyebrow: "Estamos nos casando",
  heroMessage:
    "Com muito amor, convidamos você para celebrar o início da nossa nova jornada juntos.",
  giftHeading: "Um presente de coração",
  giftIntro:
    "Sua presença já é o maior presente. Mas se quiser nos ajudar a construir esse novo capítulo, você pode contribuir com um valor via Pix.",
  chooseGiftTitle: "Escolha seu presente",
  selectAmountLabel: "Selecione um valor para contribuir:",
  customSectionTitle: "Quero contribuir com outro valor",
  customFieldLabel: "Valor personalizado",
  continueLabel: "Continuar com Pix",
  genericPaymentError: "Não foi possível gerar o pagamento Pix. Tente novamente.",
  paymentHeading: "Pagamento via Pix",
  paymentInstructions:
    "Abra o app do seu banco e escaneie o QR Code, ou copie o código abaixo.",
  copyButtonLabel: "Copiar código",
  copiedLabel: "Copiado!",
  expirationLabel: "Válido até",
  statusPending: "Aguardando confirmação do pagamento...",
  statusPaid: "Pagamento confirmado! Muito obrigado 💛",
  statusOverdue: "Esse código expirou.",
  statusRejected: "Pagamento não aprovado. Tente novamente ou escolha outro valor.",
  statusUnknown: "Não foi possível verificar o status do pagamento.",
  backLabel: "Escolher outro valor",
  giveAgainLabel: "Enviar outro presente",
  footerNote: "Com amor",
};

export const presetAmounts: number[] = [
  1,
  ...Array.from({ length: 20 }, (_, index) => (index + 1) * 50),
];

export const customAmountMinimum = 1000;
