import "server-only";

import { schema } from "@database/schema/schema.aggregate";
import { asc, count, eq, ilike, or, sql } from "drizzle-orm";
import { CUSTOMER_SERVER_ERROR_MESSAGES } from "@/modules/customers/domain/messages";
import type { CustomerAggregatesRowRaw } from "@/modules/customers/domain/types";
import type { AppDatabase } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Fetches customers filtered by query for the customers table (raw numeric totals).
 * Returns a raw projection reflecting the DB selection (no branding).
 */
export async function fetchFilteredCustomersDal(
	db: AppDatabase,
	query: string,
): Promise<CustomerAggregatesRowRaw[]> {
	try {
		return await db
			.select({
				email: schema.customers.email,
				id: schema.customers.id,
				imageUrl: schema.customers.imageUrl,
				name: schema.customers.name,
				totalInvoices: count(schema.invoices.id),
				totalPaid: sql<number | null>`sum(
            ${schema.invoices.amount}
            )
            FILTER
            (
            WHERE
            ${schema.invoices.status}
            =
            'paid'
            )`,
				totalPending: sql<number | null>`sum(
            ${schema.invoices.amount}
            )
            FILTER
            (
            WHERE
            ${schema.invoices.status}
            =
            'pending'
            )`,
			})
			.from(schema.customers)
			.leftJoin(
				schema.invoices,
				eq(schema.customers.id, schema.invoices.customerId),
			)
			.where(
				or(
					ilike(schema.customers.name, `%${query}%`),
					ilike(schema.customers.email, `%${query}%`),
				),
			)
			.groupBy(schema.customers.id)
			.orderBy(asc(schema.customers.name));
	} catch (error) {
		// Use structured logging in production
		console.error("Fetch Filtered Customers Error:", error);
		throw makeAppError(APP_ERROR_KEYS.database, {
			cause: Error.isError(error)
				? error
				: "failed to fetch filtered customers",
			message: CUSTOMER_SERVER_ERROR_MESSAGES.fetchFilteredFailed,
			metadata: {},
		});
	}
}
