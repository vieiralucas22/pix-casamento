"use client";

import { useState } from "react";
import { customAmountMinimum, siteContent } from "@/lib/content";
import { formatBRL } from "@/lib/utils";
import { Heading } from "@/components/ui/Heading";
import { PresetAmountGrid } from "@/components/gift/PresetAmountGrid";
import { CustomAmountField } from "@/components/gift/CustomAmountField";
import { GiftSummaryBar } from "@/components/gift/GiftSummaryBar";
import { PaymentScreen } from "@/components/gift/PaymentScreen";
import type { CreatePixChargeResult } from "@/lib/payments/types";

export function AmountSelector() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customDigits, setCustomDigits] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [payment, setPayment] = useState<CreatePixChargeResult | null>(null);

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

      setPayment(data);
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
        onBack={() => setPayment(null)}
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
