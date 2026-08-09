import "server-only";
import { customers } from "@database/schema/customers";
import { eq } from "drizzle-orm";
import type { CustomerEntity } from "@/modules/customers/domain/types";
import type { CustomerId } from "@/modules/customers/domain/types/customer-id.brand";
import { mapCustomerRowToEntity } from "@/modules/customers/infrastructure/adapters/customer.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { executeDalResult } from "@/shared/core/errors/server/adapters/dal/execute-dal-result";
import type { Result } from "@/shared/core/result/result.dto";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

const DAL_CONTEXT = "customers:dal";

/**
 * Reads a single customer by id.
 *
 * `null` means "no such customer" — an ordinary outcome the edit page turns
 * into a not-found message, not a failure. Only a real database fault produces
 * an `Err`.
 */
export async function readCustomerDal(
	db: AppDatabase,
	customerId: CustomerId,
): Promise<Result<CustomerEntity | null, AppError>> {
	return await executeDalResult<CustomerEntity | null>(
		async (): Promise<CustomerEntity | null> => {
			const [row] = await db
				.select({
					email: customers.email,
					id: customers.id,
					imageUrl: customers.imageUrl,
					name: customers.name,
				})
				.from(customers)
				.where(eq(customers.id, customerId))
				.limit(1);

			return row ? mapCustomerRowToEntity(row) : null;
		},
		{
			entity: "customer",
			identifiers: { customerId },
			operation: "readCustomer",
		},
		logger,
		{ operationContext: DAL_CONTEXT },
	);
}
