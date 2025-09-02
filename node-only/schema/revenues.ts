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
import {
  REVENUE_SOURCES,
  type RevenueSource,
} from "../../src/features/revenues/types";
import type { Period, RevenueId } from "../../src/shared/brands/domain-brands";
import { invoices } from "./invoices";

const calculationSourceEnum = pgEnum("calculation_source", REVENUE_SOURCES);

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
  ],
);

export const revenuesRelations = relations(revenues, ({ many }) => ({
  invoices: many(invoices),
}));

export type RevenueRow = typeof revenues.$inferSelect;
export type NewRevenueRow = typeof revenues.$inferInsert;
