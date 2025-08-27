import "server-only";

import type {
  CustomerAggregatesServerDto,
  CustomerSelectServerDto,
} from "@/features/customers/types";
import { fetchCustomersSelectDal } from "@/server/customers/dal/fetch-customers-select";
import { fetchFilteredCustomersDal } from "@/server/customers/dal/fetch-filtered-customers";
import { fetchTotalCustomersCountDal } from "@/server/customers/dal/fetch-total-count";
import {
  mapCustomerAggregatesRawToDto,
  mapCustomerSelectRawToDto,
} from "@/server/customers/mappers";
import type { Database } from "@/server/db/connection";

/**
 * Repository for Customers.
 * - DAL returns raw DB projections.
 * - Repository maps to server DTOs (brands IDs, normalizes sums).
 */
export class CustomersRepository {
  constructor(private readonly db: Database) {}

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
export function createCustomersRepository(db: Database): CustomersRepository {
  return new CustomersRepository(db);
}
