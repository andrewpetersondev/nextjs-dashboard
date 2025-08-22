import { type Period, toPeriod } from "@/shared/brands/domain-brands";

export const normalizePeriod = (p: string): string => {
  const [y, m] = p.split("-");
  const mm = String(Number(m)).padStart(2, "0");
  return `${y}-${mm}`;
};

/**
 * Normalize any acceptable input into a branded Period (first-of-month DATE).
 * Accepts:
 * - string like "2025-7", "2025-07", or a full date like "2025-07-15" (normalized to first day)
 * - { year, month } object (month can be 1-12 or zero-padded)
 * TODO: simplify this function to only accept full date like "2025-07-15" (normalized to first day)
 */
export function normalizeToPeriod(
  input: string | { year: number; month?: number; monthNumber?: number },
): Period {
  if (typeof input === "string") {
    const normalized = normalizePeriod(input);
    return toPeriod(normalized);
  }

  const { year } = input;
  const monthValue =
    (input as { monthNumber?: number }).monthNumber ??
    (input as { month?: number }).month;
  const normalized = normalizePeriod(`${year}-${monthValue}`);
  return toPeriod(normalized);
}
