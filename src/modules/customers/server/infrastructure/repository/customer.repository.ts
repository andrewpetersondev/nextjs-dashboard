import "server-only";

import type {
  CustomerAggregatesServerDto,
  CustomerSelectServerDto,
} from "@/modules/customers/domain/types";
import {
  mapCustomerAggregatesRawToDto,
  mapCustomerSelectRawToDto,
} from "@/modules/customers/server/infrastructure/adapters/customer.mapper";
import { fetchCustomersSelectDal } from "@/modules/customers/server/infrastructure/repository/dal/fetch-customers-select";
import { fetchFilteredCustomersDal } from "@/modules/customers/server/infrastructure/repository/dal/fetch-filtered-customers";
import { fetchTotalCustomersCountDal } from "@/modules/customers/server/infrastructure/repository/dal/fetch-total-count";
import type { AppDatabase } from "@/server/db/db.connection";

/**
 * Repository for Customers.
 * - DAL returns raw DB projections.
 * - Repository maps to server DTOs (brands IDs, normalizes sums).
 */
export class CustomersRepository {
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
}

/**
 * Small helper factory if you prefer function-style creation.
 */
export function createCustomersRepository(
  db: AppDatabase,
): CustomersRepository {
  return new CustomersRepository(db);
}
