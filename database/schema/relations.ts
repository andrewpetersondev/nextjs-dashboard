import { customers } from "@database/schema/customers";
import { demoUserCounters } from "@database/schema/demo-users";
import { invoices } from "@database/schema/invoices";
import { relations } from "drizzle-orm";

/** A customer owns many invoices; deleting one is guarded by a domain policy, not a cascade. */
export const customersRelations = relations(customers, ({ many }) => ({
	invoices: many(invoices),
}));

/** Declared with no relations so the table is still registered for relational queries. */
export const demoUserCountersRelations = relations(
	demoUserCounters,
	() => ({}),
);

/** The inverse of {@link customersRelations} — each invoice points at one customer. */
export const invoicesRelations = relations(invoices, ({ one }) => ({
	customer: one(customers, {
		fields: [invoices.customerId],
		references: [customers.id],
	}),
}));
