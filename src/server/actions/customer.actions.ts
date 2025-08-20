"use server";

import type {
  CustomerField,
  FormattedCustomersTableRow,
} from "@/features/customers/customer.types";
import {
  fetchCustomers,
  fetchFilteredCustomers,
} from "@/server/dals/customer.dal";
import { getDB } from "@/server/db/connection";

/**
 * Server action to read customers.
 * @returns Array of customer fields
 */
export async function readCustomersAction(): Promise<CustomerField[]> {
  const db = getDB();
  return fetchCustomers(db);
}

/**
 * Server action to fetch filtered customers for the customers table.
 * @param query - Search query string
 * @returns Array of FormattedCustomersTableRow
 */
export async function readFilteredCustomersAction(
  query: string = "",
): Promise<FormattedCustomersTableRow[]> {
  const db = getDB();
  return fetchFilteredCustomers(db, query);
}
