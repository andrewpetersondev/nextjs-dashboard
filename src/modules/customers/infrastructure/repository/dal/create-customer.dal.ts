import "server-only";
import { customers } from "@database/schema/customers";
import type {
	CreateCustomerProps,
	CustomerEntity,
} from "@/modules/customers/domain/types";
import { mapCustomerRowToEntity } from "@/modules/customers/infrastructure/adapters/customer.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { executeDalResult } from "@/shared/core/errors/server/adapters/dal/execute-dal-result";
import { PG_CODES } from "@/shared/core/errors/server/adapters/postgres/pg-error.constants";
import type { Result } from "@/shared/core/result/result.dto";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

const DAL_CONTEXT = "customers:dal";

/**
 * Inserts a customer and returns the created row.
 *
 * Returns `Result` rather than throwing, per the infrastructure rule in
 * `docs/standards/error-handling-and-result-pattern.md`. `executeDalResult`
 * routes failures through `normalizePgError`, which maps Postgres `23505`
 * (unique violation on `customers.email`) to an `AppError` keyed `conflict` —
 * that key is how the action distinguishes a duplicate email from a genuine
 * database fault.
 */
export async function createCustomerDal(
	db: AppDatabase,
	input: CreateCustomerProps,
): Promise<Result<CustomerEntity, AppError>> {
	const { email, imageUrl, name } = input;

	return await executeDalResult<CustomerEntity>(
		async (): Promise<CustomerEntity> => {
			const [row] = await db
				.insert(customers)
				.values({ email, imageUrl, name })
				.returning();

			if (!row) {
				throw makeAppError(APP_ERROR_KEYS.integrity, {
					cause: "Database returned empty result set for insert",
					message: "Insert did not return a row",
					metadata: { pgCode: PG_CODES.UNEXPECTED_INTERNAL_ERROR },
				});
			}

			return mapCustomerRowToEntity(row);
		},
		{
			entity: "customer",
			identifiers: { email, name },
			operation: "createCustomer",
		},
		logger,
		{ operationContext: DAL_CONTEXT },
	);
}
