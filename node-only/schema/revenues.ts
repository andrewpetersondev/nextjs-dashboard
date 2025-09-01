import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  integer,
  pgEnum,
  pgTable,
} from "drizzle-orm/pg-core";
import { REVENUE_SOURCES, type RevenueSource } from "@/features/revenues/types";
import type { Period, RevenueId } from "@/shared/brands/domain-brands";
import { COLUMNS, commonFields, TABLES } from "./constants";
import { invoices } from "./invoices";

const calculationSourceEnum = pgEnum(
  COLUMNS.CALCULATION_SOURCE,
  REVENUE_SOURCES,
);

/**
 * Revenues: monthly aggregates for reporting/analytics.
 * - period is the first day of the month (e.g., 2025-05-01).
 * - totalAmount is the sum of invoice amounts for that period (integer cents).
 *
 * Note: Defined before invoices to avoid forward-reference issues in pgTable column FKs.
 */
export const revenues = pgTable(
  TABLES.REVENUES,
  {
    calculationSource: calculationSourceEnum(COLUMNS.CALCULATION_SOURCE)
      .default("seed")
      .notNull()
      .$type<RevenueSource>(),
    createdAt: commonFields.timestamps.createdAt(),
    id: commonFields.id.uuid().$type<RevenueId>(),
    invoiceCount: integer(COLUMNS.INVOICE_COUNT).notNull().default(0),
    period: date(COLUMNS.PERIOD, { mode: "date" })
      .notNull()
      .unique()
      .$type<Period>(),
    // bigint to avoid overflow for large aggregates
    totalAmount: bigint(COLUMNS.TOTAL_AMOUNT, { mode: "number" })
      .notNull()
      .default(0),
    updatedAt: commonFields.timestamps.updatedAt(),
  },
  (table) => [
    // Ensure period is first-of-month
    check(
      "revenues_period_is_first_of_month",
      sql`extract(day from ${table.period}) = 1`,
    ),
    // Integrity: non-negative aggregates
    check("revenues_total_amount_non_negative", sql`${table.totalAmount} >= 0`),
    check(
      "revenues_invoice_count_non_negative",
      sql`${table.invoiceCount} >= 0`,
    ),
  ],
);

export const revenuesRelations = relations(revenues, ({ many }) => ({
  invoices: many(invoices),
}));

export type RevenueRow = typeof revenues.$inferSelect;
export type NewRevenueRow = typeof revenues.$inferInsert;
