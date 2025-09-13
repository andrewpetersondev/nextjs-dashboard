import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { Period, RevenueId } from "@/shared/domain/domain-brands";
import {
  REVENUE_SOURCES,
  type RevenueSource,
} from "../../src/features/revenues/types";
import { invoices } from "./invoices";

export const calculationSourceEnum = pgEnum(
  "calculation_source",
  REVENUE_SOURCES,
);

export const revenues = pgTable(
  "revenues",
  {
    calculationSource: calculationSourceEnum("calculation_source")
      .default("seed")
      .notNull()
      .$type<RevenueSource>(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    id: uuid("id").defaultRandom().primaryKey().$type<RevenueId>(),
    invoiceCount: integer("invoice_count").notNull().default(0),
    period: date("period", { mode: "date" }).notNull().unique().$type<Period>(),
    totalAmount: bigint("total_amount", { mode: "number" })
      .notNull()
      .default(0),
    totalPaidAmount: bigint("total_paid_amount", { mode: "number" })
      .notNull()
      .default(0),
    totalPendingAmount: bigint("total_pending_amount", { mode: "number" })
      .notNull()
      .default(0),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
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
    check(
      "revenues_total_paid_non_negative",
      sql`${table.totalPaidAmount} >= 0`,
    ),
    check(
      "revenues_total_pending_non_negative",
      sql`${table.totalPendingAmount} >= 0`,
    ),
    // Paid + Pending must not exceed Total
    check(
      "revenues_paid_plus_pending_lte_total",
      sql`${table.totalPaidAmount} + ${table.totalPendingAmount} <= ${table.totalAmount}`,
    ),
  ],
);

export const revenuesRelations = relations(revenues, ({ many }) => ({
  invoices: many(invoices),
}));

export type RevenueRow = typeof revenues.$inferSelect;
export type NewRevenueRow = typeof revenues.$inferInsert;
