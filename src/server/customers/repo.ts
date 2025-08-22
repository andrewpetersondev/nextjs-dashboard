import "server-only";

import type { CustomerField } from "@/features/customers/types";
import {
  fetchCustomers,
  fetchFilteredCustomersDal,
  fetchTotalCustomersCountDal,
} from "@/server/customers/dal";
import type { CustomerTableDbRowRaw } from "@/server/customers/types";
import type { Database } from "@/server/db/connection";

/**
 * Simple repository for Customers.
 * Wraps DAL calls to centralize data access and keep Actions clean.
 */
export class CustomersRepository {
  constructor(private readonly db: Database) {}

  /**
   * Returns customers for select options (id + name).
   */
  async fetchSelect(): Promise<CustomerField[]> {
    return fetchCustomers(this.db);
  }

  /**
   * Returns raw rows for the customers table filtered by query.
   * Mapping to UI/view model remains in the feature layer.
   */
  async fetchFiltered(query: string): Promise<CustomerTableDbRowRaw[]> {
    return fetchFilteredCustomersDal(this.db, query);
  }

  /**
   * Returns total number of customers.
   */
  async fetchTotalCount(): Promise<number> {
    return fetchTotalCustomersCountDal(this.db);
  }
}

/**
 * Small helper factory if you prefer function-style creation.
 */
export function createCustomersRepository(db: Database): CustomersRepository {
  return new CustomersRepository(db);
}
