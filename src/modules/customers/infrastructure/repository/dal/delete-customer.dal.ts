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
 * Deletes a customer by id, returning the deleted row or `null` if none matched.
 *
 * @remarks
 * This is an unconditional delete, and `invoices.customer_id` is declared
 * `ON DELETE CASCADE` — reaching this function with a customer that still has
 * invoices destroys those invoices. The referential guard lives one layer up in
 * `CustomerService.deleteCustomer`, which counts invoices first and refuses.
 * Do not call this DAL directly from an action.
 */
export async function deleteCustomerDal(
	db: AppDatabase,
	customerId: CustomerId,
): Promise<Result<CustomerEntity | null, AppError>> {
	return await executeDalResult<CustomerEntity | null>(
		async (): Promise<CustomerEntity | null> => {
			const [row] = await db
				.delete(customers)
				.where(eq(customers.id, customerId))
				.returning();

			return row ? mapCustomerRowToEntity(row) : null;
		},
		{
			entity: "customer",
			identifiers: { customerId },
			operation: "deleteCustomer",
		},
		logger,
		{ operationContext: DAL_CONTEXT },
	);
}
