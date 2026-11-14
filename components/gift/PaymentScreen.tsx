"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { siteContent } from "@/lib/content";
import { formatBRL } from "@/lib/utils";
import type { MercadoPagoOrderStatus } from "@/lib/payments/types";

const PAID_STATUSES = new Set(["processed"]);
const FINAL_STATUSES = new Set(["processed", "canceled", "failed", "refunded"]);
const POLL_INTERVAL_MS = 5000;

function statusMessage(status: MercadoPagoOrderStatus) {
  if (PAID_STATUSES.has(status)) return siteContent.statusPaid;
  if (status === "failed") return siteContent.statusRejected;
  if (status === "canceled" || status === "refunded") return siteContent.statusOverdue;
  if (status === "created" || status === "processing" || status === "action_required") {
    return siteContent.statusPending;
  }
  return siteContent.statusUnknown;
}

function formatExpiration(expirationDate: string) {
  const date = new Date(expirationDate);
  if (Number.isNaN(date.getTime())) return expirationDate;
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function PaymentScreen({
  paymentId,
  amount,
  status: initialStatus,
  qrCodeImage,
  copyPasteCode,
  expirationDate,
  onBack,
  onStatusChange,
}: {
  paymentId: string;
  amount: number;
  status: MercadoPagoOrderStatus;
  qrCodeImage: string;
  copyPasteCode: string;
  expirationDate: string;
  onBack: () => void;
  onStatusChange?: (status: MercadoPagoOrderStatus) => void;
}) {
  const [status, setStatus] = useState<MercadoPagoOrderStatus>(initialStatus);
  const [copied, setCopied] = useState(false);

  // Read via a ref inside poll() instead of a dependency: onStatusChange's
  // identity changes on every tick (the parent merges into a new object), so
  // depending on it directly would retrigger this effect — and its initial
  // poll() — every 5s regardless of whether the status actually changed.
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    if (FINAL_STATUSES.has(status)) return;

    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch(`/api/pix/${paymentId}/status`);
        if (!response.ok || cancelled) return;
        const data = await response.json();
        setStatus(data.status);
        onStatusChangeRef.current?.(data.status);
      } catch {
        // transient network error, next poll will retry
      }
    }

    // Also fire immediately — relevant when this screen was just restored
    // after the guest comes back from paying in their banking app, so the
    // confirmation shows up right away instead of after the next interval.
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [paymentId, status]);

  async function handleCopy() {
    await navigator.clipboard.writeText(copyPasteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isPaid = PAID_STATUSES.has(status);
  const isFinal = FINAL_STATUSES.has(status);

  return (
    <Card className="flex flex-col items-center gap-5 text-center">
      <Heading as="h2" className="text-xl sm:text-2xl">
        {siteContent.paymentHeading}
      </Heading>
      <p className="font-medium text-foreground">{formatBRL(amount)}</p>

      {!isFinal ? (
        <>
          <p className="text-sm text-muted">{siteContent.paymentInstructions}</p>
          <img
            src={`data:image/png;base64,${qrCodeImage}`}
            alt="QR Code Pix"
            className="h-48 w-48 rounded-xl border border-border"
          />
          <div className="flex w-full flex-col gap-2">
            <textarea
              readOnly
              value={copyPasteCode}
              className="h-20 w-full resize-none rounded-xl border border-border bg-surface p-3 text-xs text-muted"
            />
            <Button type="button" variant="outline" onClick={handleCopy}>
              {copied ? siteContent.copiedLabel : siteContent.copyButtonLabel}
            </Button>
          </div>
          <p className="text-xs text-muted">
            {siteContent.expirationLabel} {formatExpiration(expirationDate)}
          </p>
        </>
      ) : null}

      <p className="text-sm font-medium text-foreground">{statusMessage(status)}</p>

      {isPaid ? (
        <Button type="button" onClick={onBack}>
          {siteContent.giveAgainLabel}
        </Button>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted underline underline-offset-2 hover:text-accent-strong"
        >
          {siteContent.backLabel}
        </button>
      )}
    </Card>
  );
}
