import { relations } from "drizzle-orm";
import { customers } from "@/server/db/schema/customers";
import { demoUserCounters } from "@/server/db/schema/demo-users";
import { invoices } from "@/server/db/schema/invoices";
import { revenues } from "@/server/db/schema/revenues";

// biome-ignore lint/nursery/useExplicitType: fix
export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
}));

// biome-ignore lint/nursery/useExplicitType: fix
export const demoUserCountersRelations = relations(
  demoUserCounters,
  () => ({}),
);

// biome-ignore lint/nursery/useExplicitType: fix
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

// biome-ignore lint/nursery/useExplicitType: fix
export const revenuesRelations = relations(revenues, ({ many }) => ({
  invoices: many(invoices),
}));
