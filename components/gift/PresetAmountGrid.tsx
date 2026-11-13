import { presetAmounts } from "@/lib/content";
import { PresetAmountOption } from "@/components/gift/PresetAmountOption";

export function PresetAmountGrid({
  selectedValue,
  onSelect,
}: {
  selectedValue: number | null;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {presetAmounts.map((amount) => (
        <PresetAmountOption
          key={amount}
          value={amount}
          selected={selectedValue === amount}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
