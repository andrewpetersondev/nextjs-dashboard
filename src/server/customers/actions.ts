"use server";

import { toFormattedCustomersTableRow } from "@/features/customers/lib/mapToViewModel";
import type {
  CustomerField,
  FormattedCustomersTableRow,
} from "@/features/customers/types";
import {
  fetchCustomers,
  fetchFilteredCustomersDal,
} from "@/server/customers/dal";
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
  const rows = await fetchFilteredCustomersDal(db, query);
  return rows.map(toFormattedCustomersTableRow);
}
