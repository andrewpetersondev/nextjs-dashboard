import { customers } from "@database/schema/customers";
import { demoUserCounters } from "@database/schema/demo-users";
import { invoices } from "@database/schema/invoices";
import { revenues } from "@database/schema/revenues";
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
	// Link invoice to its revenue month via first-of-month date
	revenue: one(revenues, {
		fields: [invoices.revenuePeriod], // invoices.revenue_period (DATE)
		references: [revenues.period], // revenues.period (DATE, unique, first-of-month)
	}),
}));

export const revenuesRelations = relations(revenues, ({ many }) => ({
	invoices: many(invoices),
}));
