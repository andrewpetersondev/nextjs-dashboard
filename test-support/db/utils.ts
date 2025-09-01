import bcryptjs from "bcryptjs";
import { SEED_CONFIG } from "./constants";

/**
 * Validates that a period string represents the first day of a month.
 */
export function validatePeriod(period: string): void {
  const date = new Date(`${period}T00:00:00.000Z`);
  if (date.getUTCDate() !== SEED_CONFIG.FIRST_DAY_OF_MONTH) {
    throw new Error(`Generated period ${period} is not first day of month`);
  }
}

/**
 * Hashes a password using bcrypt with configured salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(SEED_CONFIG.SALT_ROUNDS);
  return bcryptjs.hash(password, salt);
}

/**
 * Generate first-of-month periods as YYYY-MM-DD strings.
 */
export function generateMonthlyPeriods(start: string, months: number): string[] {
  if (!start) {
    throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
  }
  if (!months || months < 0) {
    throw new Error(`Invalid months count: ${months}. Must be a positive integer.`);
  }
  const [yearStr, monthStr] = start.split("-");
  if (!yearStr || !monthStr) {
    throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
  }
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  if (Number.isNaN(year) || Number.isNaN(month)) {
    throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
  }

  const out: string[] = [];
  for (let i = 0; i < months; i++) {
    const currentYear = year + Math.floor((month - 1 + i) / SEED_CONFIG.MONTHS_IN_YEAR);
    const currentMonth = ((month - 1 + i) % SEED_CONFIG.MONTHS_IN_YEAR) + 1;
    const d = new Date(Date.UTC(currentYear, currentMonth - 1, SEED_CONFIG.FIRST_DAY_OF_MONTH));
    const iso = d.toISOString().slice(0, 10);
    out.push(iso);
  }
  return out;
}

export function generateInvoiceAmount(): number {
  const r = Math.random();
  if (r < SEED_CONFIG.ZERO_AMOUNT_PROBABILITY) return 0;
  if (r < SEED_CONFIG.ZERO_AMOUNT_PROBABILITY + SEED_CONFIG.SINGLE_CENT_PROBABILITY) return SEED_CONFIG.SINGLE_CENT_AMOUNT;
  if (r < SEED_CONFIG.ZERO_AMOUNT_PROBABILITY + SEED_CONFIG.SINGLE_CENT_PROBABILITY + SEED_CONFIG.MIN_AMOUNT_PROBABILITY) return SEED_CONFIG.MIN_AMOUNT_CENTS;
  if (r < SEED_CONFIG.INVOICE_REGULAR_THRESHOLD) {
    return Math.floor(Math.random() * (SEED_CONFIG.MAX_AMOUNT_CENTS - SEED_CONFIG.MIN_AMOUNT_CENTS + 1)) + SEED_CONFIG.MIN_AMOUNT_CENTS;
  }
  return Math.floor(Math.random() * (SEED_CONFIG.MAX_LARGE_AMOUNT_CENTS - SEED_CONFIG.LARGE_AMOUNT_THRESHOLD + 1)) + SEED_CONFIG.LARGE_AMOUNT_THRESHOLD;
}

export function randomInvoiceStatus(): "pending" | "paid" {
  return Math.random() < SEED_CONFIG.INVOICE_STATUS_PENDING_PROBABILITY ? "pending" : "paid";
}
