import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/TextInput";
import { customAmountMinimum, siteContent } from "@/lib/content";
import { formatBRL } from "@/lib/utils";

export function CustomAmountField({
  digits,
  error,
  onChange,
}: {
  digits: string;
  error?: string;
  onChange: (digits: string) => void;
}) {
  const value = digits ? Number(digits) / 100 : 0;
  const displayValue = digits ? formatBRL(value) : "";

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <p className="font-medium text-foreground">
          {siteContent.customSectionTitle}
        </p>
        <p className="text-sm text-muted">
          Escolha um valor acima de {formatBRL(customAmountMinimum)}
        </p>
      </div>
      <TextInput
        id="custom-amount"
        label={siteContent.customFieldLabel}
        hideLabel
        inputMode="numeric"
        placeholder="R$ 0,00"
        value={displayValue}
        error={error}
        onChange={(event) => {
          const nextDigits = event.target.value.replace(/\D/g, "").slice(0, 9);
          onChange(nextDigits);
        }}
      />
    </Card>
  );
}
