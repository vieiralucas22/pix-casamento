"use client";

import { useState } from "react";
import { customAmountMinimum, siteContent } from "@/lib/content";
import { formatBRL } from "@/lib/utils";
import { Heading } from "@/components/ui/Heading";
import { PresetAmountGrid } from "@/components/gift/PresetAmountGrid";
import { CustomAmountField } from "@/components/gift/CustomAmountField";
import { GiftSummaryBar } from "@/components/gift/GiftSummaryBar";

export function AmountSelector() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customDigits, setCustomDigits] = useState("");

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
      <GiftSummaryBar selectedAmount={selectedAmount} />
    </div>
  );
}
