import "server-only";
import type { CustomerRepositoryContract } from "@/modules/customers/application/contracts/customer-repository.contract";
import type { CustomerDto } from "@/modules/customers/application/dtos/customer.dto";
import { toCustomerDto } from "@/modules/customers/application/mappers/to-customer-dto.mapper";
import type {
	CreateCustomerData,
	EditCustomerData,
} from "@/modules/customers/domain/customer.schema";
import { evaluateCustomerDeletion } from "@/modules/customers/domain/customer-deletion.policy";
import { CUSTOMER_IMAGE_URL_NONE } from "@/modules/customers/domain/customer-policy";
import { CUSTOMER_SERVER_ERROR_MESSAGES } from "@/modules/customers/domain/messages";
import type { UpdateCustomerProps } from "@/modules/customers/domain/types";
import type { CustomerId } from "@/modules/customers/domain/types/customer-id.brand";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { normalizeUnknownError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

/**
 * Outcome of a delete attempt.
 *
 * `blocked` is an ordinary outcome, not an `Err`: a customer who still has
 * invoices is an expected state of the world, and the action needs the count to
 * explain the refusal. Reserving `Err` for technical failures is the rule in
 * `docs/standards/error-handling-and-result-pattern.md`.
 */
export type DeleteCustomerOutcome =
	| { readonly status: "deleted"; readonly customer: CustomerDto }
	| {
			readonly status: "blocked";
			readonly customer: CustomerDto;
			readonly invoiceCount: number;
	  }
	| { readonly status: "not-found" };

/**
 * Outcome of an update attempt, distinguishing "saved" from "nothing to save".
 */
export type UpdateCustomerOutcome =
	| { readonly status: "updated"; readonly customer: CustomerDto }
	| { readonly status: "unchanged"; readonly customer: CustomerDto }
	| { readonly status: "not-found" };

export class CustomerService {
	private readonly logger: LoggingClientContract;
	private readonly repo: CustomerRepositoryContract;

	constructor(repo: CustomerRepositoryContract, logger: LoggingClientContract) {
		this.repo = repo;
		this.logger = logger.child({ scope: "customer-service" });
	}

	async createCustomer(
		input: CreateCustomerData,
	): Promise<Result<CustomerDto, AppError>> {
		try {
			// The form has no image field — avatars are local files under
			// `public/customers/`, so a new customer starts with none and renders
			// initials instead.
			const result = await this.repo.create({
				email: input.email,
				imageUrl: CUSTOMER_IMAGE_URL_NONE,
				name: input.name,
			});

			if (!result.ok) {
				return result;
			}

			this.logger.info("Customer created successfully", {
				logging: { email: input.email, name: input.name },
			});

			return Ok(toCustomerDto(result.value));
		} catch (err) {
			const error = normalizeUnknownError(err, APP_ERROR_KEYS.unexpected);
			this.logger.error("Customer creation failed", {
				error,
				logging: { email: input.email },
			});
			return Err(error);
		}
	}

	async readCustomerById(
		id: CustomerId,
	): Promise<Result<CustomerDto | null, AppError>> {
		try {
			const result = await this.repo.readById(id);

			if (!result.ok) {
				return result;
			}

			return Ok(result.value ? toCustomerDto(result.value) : null);
		} catch (err) {
			const error = normalizeUnknownError(err, APP_ERROR_KEYS.unexpected);
			this.logger.error(CUSTOMER_SERVER_ERROR_MESSAGES.readFailed, {
				error,
				logging: { customerId: id },
			});
			return Err(error);
		}
	}

	async updateCustomer(
		id: CustomerId,
		patch: EditCustomerData,
	): Promise<Result<UpdateCustomerOutcome, AppError>> {
		try {
			const existingRes = await this.repo.readById(id);

			if (!existingRes.ok) {
				return existingRes;
			}
			if (!existingRes.value) {
				return Ok({ status: "not-found" });
			}

			const existing = existingRes.value;

			// Only fields that differ are sent. An empty patch is short-circuited
			// here because `UPDATE ... SET` with no assignments is a SQL syntax
			// error — the DAL must never receive one.
			const changes: UpdateCustomerProps = {};
			if (patch.email !== undefined && patch.email !== existing.email) {
				changes.email = patch.email;
			}
			if (patch.name !== undefined && patch.name !== existing.name) {
				changes.name = patch.name;
			}

			if (Object.keys(changes).length === 0) {
				return Ok({ customer: toCustomerDto(existing), status: "unchanged" });
			}

			const result = await this.repo.update(id, changes);

			if (!result.ok) {
				return result;
			}
			if (!result.value) {
				return Ok({ status: "not-found" });
			}

			this.logger.info("Customer updated successfully", {
				logging: { customerId: id },
			});

			return Ok({ customer: toCustomerDto(result.value), status: "updated" });
		} catch (err) {
			const error = normalizeUnknownError(err, APP_ERROR_KEYS.unexpected);
			this.logger.error("Customer update failed", {
				error,
				logging: { customerId: id },
			});
			return Err(error);
		}
	}

	/**
	 * Deletes a customer, refusing when invoices still reference them.
	 *
	 * The read-then-count-then-delete sequence is deliberately ordered: the
	 * customer is read first so a refusal can name them, and the count is taken
	 * before the delete because the delete itself cascades and cannot be undone.
	 *
	 * @remarks
	 * This is a check-then-act sequence, so an invoice created for this customer
	 * between the count and the delete would still be cascaded away. Closing that
	 * window needs a transaction or an `ON DELETE RESTRICT` constraint; at this
	 * app's concurrency the guard is the demo-facing safeguard, and the schema
	 * change is the durable fix. Recorded in the module README.
	 */
	async deleteCustomer(
		id: CustomerId,
	): Promise<Result<DeleteCustomerOutcome, AppError>> {
		try {
			const existingRes = await this.repo.readById(id);

			if (!existingRes.ok) {
				return existingRes;
			}
			if (!existingRes.value) {
				return Ok({ status: "not-found" });
			}

			const customer = toCustomerDto(existingRes.value);

			const countRes = await this.repo.countInvoices(id);

			if (!countRes.ok) {
				return countRes;
			}

			const decision = evaluateCustomerDeletion(countRes.value);

			if (!decision.allowed) {
				this.logger.info("Customer delete refused — invoices reference it", {
					logging: { customerId: id, invoiceCount: decision.invoiceCount },
				});
				return Ok({
					customer,
					invoiceCount: decision.invoiceCount,
					status: "blocked",
				});
			}

			const result = await this.repo.delete(id);

			if (!result.ok) {
				return result;
			}
			if (!result.value) {
				return Ok({ status: "not-found" });
			}

			this.logger.info("Customer deleted successfully", {
				logging: { customerId: id },
			});

			return Ok({ customer: toCustomerDto(result.value), status: "deleted" });
		} catch (err) {
			const error = normalizeUnknownError(err, APP_ERROR_KEYS.unexpected);
			this.logger.error("Customer deletion failed", {
				error,
				logging: { customerId: id },
			});
			return Err(error);
		}
	}
}
