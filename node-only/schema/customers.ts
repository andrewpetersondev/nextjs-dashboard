import { relations } from "drizzle-orm";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import type { CustomerId } from "../../src/shared/brands/domain-brands";
import { COLUMNS, commonFields, TABLES } from "./constants";

import { invoices } from "./invoices";

/**
 * Customers: customer information for invoices.
 */
export const customers = pgTable(TABLES.CUSTOMERS, {
  email: commonFields.email(),
  id: commonFields.id.uuid().$type<CustomerId>(),
  imageUrl: varchar(COLUMNS.IMAGE_URL, { length: 255 }).notNull(),
  name: commonFields.name(),
  sensitiveData: commonFields.sensitiveData(),
});

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
}));

export type CustomerRow = typeof customers.$inferSelect;
export type NewCustomerRow = typeof customers.$inferInsert;
