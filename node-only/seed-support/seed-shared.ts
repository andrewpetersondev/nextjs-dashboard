import type { Period } from "../../src/shared/brands/domain-brands";
import type { invoices } from "../schema/invoices";
import { SEED_CONFIG } from "./constants";
import { generateMonthlyPeriods } from "./utils";

/**
 * NewInvoice insert type from schema.
 */
export type NewInvoice = typeof invoices.$inferInsert;

/**
 * Seed roles used for demo users.
 */
export const roles = ["guest", "admin", "user"] as const;

/**
 * Demo customers data used during seeding.
 */
export const customersData: ReadonlyArray<{
  readonly name: string;
  readonly email: string;
  readonly imageUrl: string;
}> = [
  {
    email: "evil@rabbit.com",
    imageUrl: "/customers/evil-rabbit.png",
    name: "Evil Rabbits",
  },
  {
    email: "delba@oliveira.com",
    imageUrl: "/customers/delba-de-oliveira.png",
    name: "Delba de Oliveira",
  },
  {
    email: "lee@robinson.com",
    imageUrl: "/customers/lee-robinson.png",
    name: "Lee Robinson",
  },
  {
    email: "michael@novotny.com",
    imageUrl: "/customers/michael-novotny.png",
    name: "Michael Novotny",
  },
  {
    email: "amy@burns.com",
    imageUrl: "/customers/amy-burns.png",
    name: "Amy Burns",
  },
  {
    email: "balazs@orban.com",
    imageUrl: "/customers/balazs-orban.png",
    name: "Balazs Orban",
  },
] as const;

/**
 * Generated seed periods and corresponding Date values.
 */
export const periods: readonly string[] = generateMonthlyPeriods(
  "2024-01-01",
  SEED_CONFIG.GENERATE_MONTHLY_PERIODS_COUNT,
);

export const periodDates: ReadonlyArray<Date & Period> = periods.map(
  (p) => new Date(`${p}T00:00:00.000Z`) as Date & Period,
);
