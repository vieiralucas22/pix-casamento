import { Chip } from "@/components/ui/Chip";
import { formatBRL } from "@/lib/utils";

export function PresetAmountOption({
  value,
  selected,
  onSelect,
}: {
  value: number;
  selected: boolean;
  onSelect: (value: number) => void;
}) {
  return (
    <Chip selected={selected} onClick={() => onSelect(value)}>
      {formatBRL(value)}
    </Chip>
  );
}
