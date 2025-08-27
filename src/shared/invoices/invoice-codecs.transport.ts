// shared/invoices/transport-codecs.ts
// What is a codec? A function that converts a value to a different format for transport

import type { Period } from "@/shared/brands/domain-brands";
import { periodKey } from "@/shared/revenues/period";

/** Formats a Date to YYYY-MM-DD for transport. */
export function toISODateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Formats a Period to YYYY-MM-01 (first-of-month date) for transport. */
export function toPeriodFirstDayString(p: Period): string {
  return `${periodKey(p)}-01`;
}
