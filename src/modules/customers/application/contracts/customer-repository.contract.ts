import type {
	CreateCustomerProps,
	CustomerEntity,
	UpdateCustomerProps,
} from "@/modules/customers/domain/types";
import type { CustomerId } from "@/modules/customers/domain/types/customer-id.brand";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/result/result.dto";

/**
 * Port describing the persistence the customer use cases depend on.
 *
 * Declared here, in `application/`, so the dependency arrow points inwards:
 * `CustomerService` knows this interface, not the Drizzle-backed class that
 * implements it. Only the write half is modeled — the read paths (table
 * aggregates, select options, total count) are called straight from their
 * actions and have no use case to orchestrate.
 */
export interface CustomerRepositoryContract {
	/**
	 * Counts invoices referencing the customer — the input to the delete guard.
	 */
	countInvoices(id: CustomerId): Promise<Result<number, AppError>>;
	create(input: CreateCustomerProps): Promise<Result<CustomerEntity, AppError>>;

	delete(id: CustomerId): Promise<Result<CustomerEntity | null, AppError>>;

	readById(id: CustomerId): Promise<Result<CustomerEntity | null, AppError>>;

	update(
		id: CustomerId,
		patch: UpdateCustomerProps,
	): Promise<Result<CustomerEntity | null, AppError>>;
}
