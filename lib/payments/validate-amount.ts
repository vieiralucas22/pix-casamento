import { customAmountMinimum, presetAmounts } from "@/lib/content";

export const maxGiftAmount = 50_000;

export function isValidGiftAmount(amount: unknown): amount is number {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return false;
  }

  if (amount > maxGiftAmount) {
    return false;
  }

  if (presetAmounts.includes(amount)) {
    return true;
  }

  return amount > customAmountMinimum;
}
