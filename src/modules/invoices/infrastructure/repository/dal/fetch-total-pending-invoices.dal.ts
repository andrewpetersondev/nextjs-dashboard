import "server-only";
import { invoices } from "@database/schema/invoices";
import { eq, sql } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { AppDatabase } from "@/server/db/db.connection";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Sums the amounts of all pending invoices.
 *
 * @returns The total in cents, or `0` when nothing is pending — SQL `sum()` over
 * no rows yields NULL, which is coalesced here rather than propagated.
 */
export async function fetchTotalPendingInvoicesDal(
	db: AppDatabase,
): Promise<number> {
	const pending = await db
		.select({
			value: sql<number>`sum(
            ${invoices.amount}
            )`,
		})
		.from(invoices)
		.where(eq(invoices.status, "pending"))
		.then((rows) => rows[0]?.value ?? 0);

	if (pending === undefined) {
		throw makeAppError("database", {
			cause: "",
			message: INVOICE_MSG.fetchTotalPendingFailed,
			metadata: {},
		});
	}

	return pending;
}
