import "server-only";
import { invoices } from "@database/schema/invoices";
import { count, eq } from "drizzle-orm";
import type { CustomerId } from "@/modules/customers/domain/types/customer-id.brand";
import type { AppDatabase } from "@/server/db/db.connection";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { executeDalResult } from "@/shared/core/errors/server/adapters/dal/execute-dal-result";
import type { Result } from "@/shared/core/result/result.dto";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

const DAL_CONTEXT = "customers:dal";

/**
 * Counts the invoices referencing a customer.
 *
 * This reads the `invoices` table but not the `invoices` module — the same
 * cross-table, single-module boundary the aggregate query in
 * `fetch-filtered-customers` already relies on.
 *
 * A missing count row is reported as `0` rather than an error: `COUNT(*)`
 * always returns a row, so the fallback is unreachable in practice and
 * defaulting keeps the delete guard from failing closed on a phantom.
 */
export async function countCustomerInvoicesDal(
	db: AppDatabase,
	customerId: CustomerId,
): Promise<Result<number, AppError>> {
	return await executeDalResult<number>(
		async (): Promise<number> => {
			const [row] = await db
				.select({ value: count() })
				.from(invoices)
				.where(eq(invoices.customerId, customerId));

			return row?.value ?? 0;
		},
		{
			entity: "customer",
			identifiers: { customerId },
			operation: "countCustomerInvoices",
		},
		logger,
		{ operationContext: DAL_CONTEXT },
	);
}
