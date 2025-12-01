import type { Period } from "@/shared/branding/brands";
import { toCustomerId } from "@/shared/branding/converters/id-converters";
import {
  ADMIN_ROLE,
  GUEST_ROLE,
  USER_ROLE,
  type UserRole,
} from "../../src/features/auth/lib/auth.roles";
import type { PasswordHash } from "../../src/features/auth/lib/password.types";
import type { invoices } from "../../src/server/db/schema/invoices";
import { SEED_CONFIG } from "./constants";
import { type NewInvoice, periods } from "./seed-shared";
import {
  generateInvoiceAmount,
  hashPassword,
  randomInvoiceStatus,
  validatePeriod,
} from "./utils";

/**
 * Build demo users with hashed passwords.
 */
export async function buildUserSeed(): Promise<
  ReadonlyArray<{
    readonly email: string;
    readonly password: PasswordHash;
    readonly role: UserRole;
    readonly username: string;
  }>
> {
  return [
    {
      email: "user@user.com",
      password: await hashPassword("UserPassword123!"),
      role: USER_ROLE,
      username: "user",
    },
    {
      email: "admin@admin.com",
      password: await hashPassword("AdminPassword123!"),
      role: ADMIN_ROLE,
      username: "admin",
    },
    {
      email: "guest@guest.com",
      password: await hashPassword("GuestPassword123!"),
      role: GUEST_ROLE,
      username: "guest",
    },
  ] as const;
}

/**
 * Build randomized invoice rows based on existing customers and generated periods.
 */
export function buildRandomInvoiceRows(
  existingCustomers: ReadonlyArray<{ readonly id: string }>,
): NewInvoice[] {
  const invoiceRows: NewInvoice[] = [];
  for (let i = 0; i < SEED_CONFIG.invoiceCount; i++) {
    const customer =
      existingCustomers[Math.floor(Math.random() * existingCustomers.length)];
    const period = periods[Math.floor(Math.random() * periods.length)];
    if (!customer?.id) {
      throw new Error(`Invalid customer at index ${i}`);
    }
    if (!period) {
      throw new Error(`Invalid period at index ${i}`);
    }
    validatePeriod(period);
    const revenuePeriod = new Date(`${period}T00:00:00.000Z`);
    const [year, month] = period.split("-").map(Number);
    if (
      !(year && month) ||
      month < SEED_CONFIG.minMonth ||
      month > SEED_CONFIG.monthsInYear
    ) {
      throw new Error(`Invalid period format: ${period}. Expected YYYY-MM-DD`);
    }
    const daysInMonth = new Date(year, month, 0).getDate();
    const randomDay =
      Math.floor(Math.random() * daysInMonth) + SEED_CONFIG.firstDayOfMonth;
    const invoiceDate = new Date(Date.UTC(year, month - 1, randomDay));

    invoiceRows.push({
      amount: generateInvoiceAmount(),
      customerId: toCustomerId(customer.id),
      date: invoiceDate,
      revenuePeriod: revenuePeriod as Period,
      status: randomInvoiceStatus(),
    } as typeof invoices.$inferInsert);
  }
  return invoiceRows;
}
