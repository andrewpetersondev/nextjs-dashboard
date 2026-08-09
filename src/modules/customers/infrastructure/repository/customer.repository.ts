import "server-only";

import type {
	CreateCustomerProps,
	CustomerAggregatesServerDto,
	CustomerEntity,
	CustomerSelectServerDto,
	UpdateCustomerProps,
} from "@/modules/customers/domain/types";
import type { CustomerId } from "@/modules/customers/domain/types/customer-id.brand";
import {
	mapCustomerAggregatesRawToDto,
	mapCustomerSelectRawToDto,
} from "@/modules/customers/infrastructure/adapters/customer.mapper";
import { countCustomerInvoicesDal } from "@/modules/customers/infrastructure/repository/dal/count-customer-invoices.dal";
import { createCustomerDal } from "@/modules/customers/infrastructure/repository/dal/create-customer.dal";
import { deleteCustomerDal } from "@/modules/customers/infrastructure/repository/dal/delete-customer.dal";
import { fetchCustomersSelectDal } from "@/modules/customers/infrastructure/repository/dal/fetch-customers-select";
import { fetchFilteredCustomersDal } from "@/modules/customers/infrastructure/repository/dal/fetch-filtered-customers";
import { fetchTotalCustomersCountDal } from "@/modules/customers/infrastructure/repository/dal/fetch-total-count";
import { readCustomerDal } from "@/modules/customers/infrastructure/repository/dal/read-customer.dal";
import { updateCustomerDal } from "@/modules/customers/infrastructure/repository/dal/update-customer.dal";
import type { AppDatabase } from "@/server/db/db.connection";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/result/result.dto";

/**
 * Repository for Customers.
 * - DAL returns raw DB projections.
 * - Repository maps to server DTOs (brands IDs, normalizes sums).
 *
 * @remarks
 * The read and write halves report failure differently, and that split is
 * inherited rather than chosen: the original read DALs predate the
 * "infrastructure returns `Result`" rule and **throw** `AppError`, while every
 * write path added here returns `Result<T, AppError>` as the standard requires.
 * Converting the reads is a separate change — they have their own callers and
 * their own tests.
 */
class CustomersRepository {
	private readonly db: AppDatabase;

	constructor(db: AppDatabase) {
		this.db = db;
	}

	/**
	 * Returns customers for select options (id + name) as server DTOs.
	 */
	async fetchSelect(): Promise<CustomerSelectServerDto[]> {
		const rows = await fetchCustomersSelectDal(this.db);
		return rows.map(mapCustomerSelectRawToDto);
	}

	/**
	 * Returns aggregated rows for the customers table filtered by query as server DTOs.
	 */
	async fetchFiltered(query: string): Promise<CustomerAggregatesServerDto[]> {
		const rows = await fetchFilteredCustomersDal(this.db, query);
		return rows.map(mapCustomerAggregatesRawToDto);
	}

	/**
	 * Returns total number of customers.
	 */
	async fetchTotalCount(): Promise<number> {
		return await fetchTotalCustomersCountDal(this.db);
	}

	/**
	 * Reads one customer by id. `null` means no such customer.
	 */
	async readById(
		id: CustomerId,
	): Promise<Result<CustomerEntity | null, AppError>> {
		return await readCustomerDal(this.db, id);
	}

	/**
	 * Inserts a customer. A duplicate email surfaces as an `AppError` keyed
	 * `conflict`, mapped from Postgres `23505`.
	 */
	async create(
		input: CreateCustomerProps,
	): Promise<Result<CustomerEntity, AppError>> {
		return await createCustomerDal(this.db, input);
	}

	/**
	 * Applies a non-empty patch. `null` means no such customer.
	 */
	async update(
		id: CustomerId,
		patch: UpdateCustomerProps,
	): Promise<Result<CustomerEntity | null, AppError>> {
		return await updateCustomerDal(this.db, id, patch);
	}

	/**
	 * Deletes unconditionally — cascading to the customer's invoices. Callers
	 * must run {@link countInvoices} first; the guard lives in the service.
	 */
	async delete(
		id: CustomerId,
	): Promise<Result<CustomerEntity | null, AppError>> {
		return await deleteCustomerDal(this.db, id);
	}

	/**
	 * Counts invoices referencing a customer, for the delete guard.
	 */
	async countInvoices(id: CustomerId): Promise<Result<number, AppError>> {
		return await countCustomerInvoicesDal(this.db, id);
	}
}

/**
 * Small helper factory if you prefer function-style creation.
 */
export function createCustomersRepository(
	db: AppDatabase,
): CustomersRepository {
	return new CustomersRepository(db);
}

export type { CustomersRepository };
