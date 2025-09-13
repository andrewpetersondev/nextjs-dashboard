import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  index,
  pgEnum,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type {
  CustomerId,
  InvoiceId,
  Period,
} from "@/shared/domain/domain-brands";
import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/shared/invoices/dto/types";
import { customers } from "./customers";
import { revenues } from "./revenues";

export const statusEnum = pgEnum("status", INVOICE_STATUSES);

export const invoices = pgTable(
  "invoices",
  {
    // bigint cents to avoid overflow on large invoice amounts
    amount: bigint("amount", { mode: "number" }).notNull(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" })
      .$type<CustomerId>(),
    date: date("date", { mode: "date" }).notNull(),
    id: uuid("id").defaultRandom().primaryKey().$type<InvoiceId>(),
    revenuePeriod: date("revenue_period", { mode: "date" })
      .notNull()
      .references(() => revenues.period, { onDelete: "restrict" })
      .$type<Period>(),
    sensitiveData: varchar("sensitive_data", { length: 255 })
      .notNull()
      .default("cantTouchThis"),
    status: statusEnum("status")
      .default("pending")
      .notNull()
      .$type<InvoiceStatus>(),
  },
  (table) => {
    return [
      // Integrity: amount must be non-negative
      check("invoices_amount_non_negative", sql`${table.amount} >= 0`),
      // Integrity: keep revenuePeriod aligned with date's month (first day)
      check(
        "invoices_revenue_period_matches_date",
        sql`${table.revenuePeriod} = date_trunc('month',${table.date})::date`,
      ),
      // Performance: efficient joins/filters
      index("invoices_customer_id_idx").on(table.customerId),
      index("invoices_revenue_period_idx").on(table.revenuePeriod),
      // Helpful filter: by customer + status
      index("invoices_customer_id_status_idx").on(
        table.customerId,
        table.status,
      ),
    ];
  },
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
