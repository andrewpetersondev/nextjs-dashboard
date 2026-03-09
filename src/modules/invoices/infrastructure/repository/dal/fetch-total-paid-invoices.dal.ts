import "server-only";
import { schema } from "@database/schema/schema.aggregate";
import { eq, sql } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { AppDatabase } from "@/server/db/db.connection";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

export async function fetchTotalPaidInvoicesDal(
	db: AppDatabase,
): Promise<number> {
	const paid = await db
		.select({
			value: sql<number>`sum(
            ${schema.invoices.amount}
            )`,
		})
		.from(schema.invoices)
		.where(eq(schema.invoices.status, "paid"))
		.then((rows) => rows[0]?.value ?? 0);

	if (paid === undefined) {
		throw makeAppError("database", {
			cause: "",
			message: INVOICE_MSG.fetchTotalPaidFailed,
			metadata: {},
		});
	}

	return paid;
}
