"use client";

import { useState } from "react";
import { customAmountMinimum, siteContent } from "@/lib/content";
import { formatBRL } from "@/lib/utils";
import { Heading } from "@/components/ui/Heading";
import { PresetAmountGrid } from "@/components/gift/PresetAmountGrid";
import { CustomAmountField } from "@/components/gift/CustomAmountField";
import { GiftSummaryBar } from "@/components/gift/GiftSummaryBar";
import { PaymentScreen } from "@/components/gift/PaymentScreen";
import {
  clearPendingPayment,
  savePendingPayment,
  usePendingPayment,
} from "@/lib/payments/storage";
import type { MercadoPagoOrderStatus } from "@/lib/payments/types";

export function AmountSelector() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customDigits, setCustomDigits] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // sessionStorage is the single source of truth for the active payment —
  // this is what lets the confirmation survive the silent reload mobile
  // browsers do when a guest leaves to pay in their banking app and comes
  // back, instead of dropping them on the amount selector with no sign
  // their Pix went through.
  const payment = usePendingPayment();

  function handleBack() {
    clearPendingPayment();
  }

  function handleStatusChange(status: MercadoPagoOrderStatus) {
    if (!payment) return;
    savePendingPayment({ ...payment, status });
  }

  const customValue = customDigits ? Number(customDigits) / 100 : null;
  const customError =
    customValue !== null && customValue <= customAmountMinimum
      ? `O valor personalizado deve ser maior que ${formatBRL(customAmountMinimum)}`
      : undefined;

  const selectedAmount =
    selectedPreset ??
    (customValue !== null && customValue > customAmountMinimum
      ? customValue
      : null);

  function handleSelectPreset(value: number) {
    setSelectedPreset(value);
    setCustomDigits("");
  }

  function handleCustomChange(digits: string) {
    setCustomDigits(digits);
    setSelectedPreset(null);
  }

  async function handleContinue() {
    if (selectedAmount === null) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? siteContent.genericPaymentError);
      }

      savePendingPayment(data);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : siteContent.genericPaymentError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (payment) {
    return (
      <PaymentScreen
        paymentId={payment.paymentId}
        amount={payment.amount}
        status={payment.status}
        qrCodeImage={payment.qrCodeImage}
        copyPasteCode={payment.copyPasteCode}
        expirationDate={payment.expirationDate}
        onBack={handleBack}
        onStatusChange={handleStatusChange}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading as="h2" className="text-xl sm:text-2xl">
          {siteContent.chooseGiftTitle}
        </Heading>
        <p className="mt-1 text-sm text-muted">{siteContent.selectAmountLabel}</p>
      </div>
      <PresetAmountGrid
        selectedValue={selectedPreset}
        onSelect={handleSelectPreset}
      />
      <CustomAmountField
        digits={customDigits}
        error={customError}
        onChange={handleCustomChange}
      />
      <GiftSummaryBar
        selectedAmount={selectedAmount}
        isSubmitting={isSubmitting}
        error={submitError}
        onContinue={handleContinue}
      />
    </div>
  );
}
