import { Button } from "@/components/ui/Button";
import { siteContent } from "@/lib/content";
import { formatBRL } from "@/lib/utils";

export function GiftSummaryBar({
  selectedAmount,
  isSubmitting,
  error,
  onContinue,
}: {
  selectedAmount: number | null;
  isSubmitting: boolean;
  error: string | null;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {selectedAmount !== null ? (
        <p className="text-sm text-muted">
          Você está contribuindo com{" "}
          <span className="font-medium text-foreground">
            {formatBRL(selectedAmount)}
          </span>
        </p>
      ) : null}
      <Button
        type="button"
        variant="primary"
        disabled={selectedAmount === null || isSubmitting}
        onClick={onContinue}
        className="w-full"
      >
        {isSubmitting ? "Gerando pagamento..." : siteContent.continueLabel}
      </Button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
