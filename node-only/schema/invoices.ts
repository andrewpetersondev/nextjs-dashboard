import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  index,
  pgEnum,
  pgTable,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  CustomerId,
  InvoiceId,
  Period,
} from "../../src/shared/brands/domain-brands";
import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "../../src/shared/invoices/types";
import { COLUMNS, commonFields, TABLES } from "./constants";
import { customers } from "./customers";
import { revenues } from "./revenues";

const statusEnum = pgEnum(COLUMNS.STATUS, INVOICE_STATUSES);

/**
 * Invoices: links customers to their invoices.
 * - revenuePeriod is the first day of the month this invoice contributes to.
 */
export const invoices = pgTable(
  TABLES.INVOICES,
  {
    // bigint cents to avoid overflow on large invoice amounts
    amount: bigint(COLUMNS.AMOUNT, { mode: "number" }).notNull(),
    customerId: uuid(COLUMNS.CUSTOMER_ID)
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" })
      .$type<CustomerId>(),
    date: date(COLUMNS.DATE, { mode: "date" }).notNull(),
    id: commonFields.id.uuid().$type<InvoiceId>(),
    revenuePeriod: date(COLUMNS.REVENUE_PERIOD, { mode: "date" })
      .notNull()
      .references(() => revenues.period, { onDelete: "restrict" })
      .$type<Period>(),
    sensitiveData: commonFields.sensitiveData(),
    status: statusEnum(COLUMNS.STATUS)
      .default("pending")
      .notNull()
      .$type<InvoiceStatus>(),
  },
  (table) => [
    // Integrity: amount must be non-negative
    check("invoices_amount_non_negative", sql`${table.amount} >= 0`),
    // Integrity: keep revenuePeriod aligned with date's month (first day)
    check(
      "invoices_revenue_period_matches_date",
      sql`${table.revenuePeriod} = date_trunc('month', ${table.date})::date`,
    ),
    // Performance: efficient joins/filters
    index("invoices_customer_id_idx").on(table.customerId),
    index("invoices_revenue_period_idx").on(table.revenuePeriod),
    // Helpful filter: by customer + status
    index("invoices_customer_id_status_idx").on(table.customerId, table.status),
  ],
);

export const invoicesRelations = relations(invoices, ({ one }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  // Link invoice to its revenue month via first-of-month date
  revenue: one(revenues, {
    fields: [invoices.revenuePeriod], // invoices.revenue_period (DATE)
    references: [revenues.period], // revenues.period (DATE, unique, first-of-month)
  }),
}));

export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoiceRow = typeof invoices.$inferInsert;
