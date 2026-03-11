import { customers } from "@database/schema/customers";
import { revenues } from "@database/schema/revenues";
import {
	INVOICE_STATUSES,
	type InvoiceStatus,
} from "@database/schema/schema.constants";
import type {
	CustomerId,
	InvoiceId,
	Period,
} from "@database/schema/schema.types";
import { sql } from "drizzle-orm";
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

const statusEnum = pgEnum("status", INVOICE_STATUSES);

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

export type InvoiceRow = typeof invoices.$inferSelect;
export type _NewInvoiceRow = typeof invoices.$inferInsert;
