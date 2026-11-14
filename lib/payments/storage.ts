"use client";

import { useSyncExternalStore } from "react";
import type { CreatePixChargeResult } from "@/lib/payments/types";

const STORAGE_KEY = "pix-casamento:active-payment";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

// sessionStorage survives the silent reload mobile browsers do when a guest
// switches to their banking app and back, but clears once the tab is closed.
export function savePendingPayment(payment: CreatePixChargeResult) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payment));
  } catch {
    // storage unavailable (private browsing, etc.) — safe to ignore
  }
  notify();
}

export function clearPendingPayment() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  notify();
}

let cachedRaw: string | null = null;
let cachedPayment: CreatePixChargeResult | null = null;

function getSnapshot(): CreatePixChargeResult | null {
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedPayment = raw ? (JSON.parse(raw) as CreatePixChargeResult) : null;
    } catch {
      cachedPayment = null;
    }
  }

  return cachedPayment;
}

function getServerSnapshot(): CreatePixChargeResult | null {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Single source of truth for the in-progress payment — reads/writes go
// through sessionStorage directly so a page reload (e.g. returning from a
// banking app) never loses track of an active charge.
export function usePendingPayment() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
