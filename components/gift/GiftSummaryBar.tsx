import { Button } from "@/components/ui/Button";
import { siteContent } from "@/lib/content";
import { formatBRL } from "@/lib/utils";

export function GiftSummaryBar({ selectedAmount }: { selectedAmount: number | null }) {
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
      <Button variant="primary" disabled className="w-full">
        {siteContent.continueLabel}
      </Button>
    </div>
  );
}
