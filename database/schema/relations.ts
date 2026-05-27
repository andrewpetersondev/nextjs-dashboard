import { customers } from "@database/schema/customers";
import { demoUserCounters } from "@database/schema/demo-users";
import { invoices } from "@database/schema/invoices";
import { relations } from "drizzle-orm";

export const customersRelations = relations(customers, ({ many }) => ({
	invoices: many(invoices),
}));

export const demoUserCountersRelations = relations(
	demoUserCounters,
	() => ({}),
);

export const invoicesRelations = relations(invoices, ({ one }) => ({
	customer: one(customers, {
		fields: [invoices.customerId],
		references: [customers.id],
	}),
}));
