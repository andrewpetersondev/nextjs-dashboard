import "server-only";
import { CustomerService } from "@/modules/customers/application/services/customer.service";
import { createCustomersRepository } from "@/modules/customers/infrastructure/repository/customer.repository";
import type { AppDatabase } from "@/server/db/db.connection";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

/**
 * Wires the customer use cases to their Drizzle-backed persistence.
 *
 * The repository satisfies `CustomerRepositoryContract` structurally, so no
 * adapter class is needed — its write methods already return
 * `Result<T, AppError>` in the shape the port declares.
 */
export function createCustomerService(db: AppDatabase): CustomerService {
	return new CustomerService(createCustomersRepository(db), logger);
}
