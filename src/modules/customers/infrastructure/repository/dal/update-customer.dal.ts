import "server-only";
import { customers } from "@database/schema/customers";
import { eq } from "drizzle-orm";
import type {
	CustomerEntity,
	UpdateCustomerProps,
} from "@/modules/customers/domain/types";
import type { CustomerId } from "@/modules/customers/domain/types/customer-id.brand";
import { mapCustomerRowToEntity } from "@/modules/customers/infrastructure/adapters/customer.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { executeDalResult } from "@/shared/core/errors/server/adapters/dal/execute-dal-result";
import type { Result } from "@/shared/core/result/result.dto";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

const DAL_CONTEXT = "customers:dal";

/**
 * Applies a partial update and returns the updated row, or `null` when no
 * customer matched the id.
 *
 * The caller is responsible for not passing an empty patch — an `UPDATE ... SET`
 * with no assignments is a SQL syntax error, so the service short-circuits the
 * no-op case before reaching here.
 */
export async function updateCustomerDal(
	db: AppDatabase,
	customerId: CustomerId,
	patch: UpdateCustomerProps,
): Promise<Result<CustomerEntity | null, AppError>> {
	return await executeDalResult<CustomerEntity | null>(
		async (): Promise<CustomerEntity | null> => {
			const [row] = await db
				.update(customers)
				.set(patch)
				.where(eq(customers.id, customerId))
				.returning();

			return row ? mapCustomerRowToEntity(row) : null;
		},
		{
			entity: "customer",
			identifiers: { customerId },
			operation: "updateCustomer",
		},
		logger,
		{ operationContext: DAL_CONTEXT },
	);
}
