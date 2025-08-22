"use server";

import { toFormattedCustomersTableRow } from "@/features/customers/lib/mapToViewModel";
import type {
  CustomerField,
  FormattedCustomersTableRow,
} from "@/features/customers/types";
import { createCustomersRepository } from "@/server/customers/repo";
import { getDB } from "@/server/db/connection";

/**
 * Server action to read customers.
 * @returns Array of customer fields
 */
export async function readCustomersAction(): Promise<CustomerField[]> {
  const db = getDB();
  const repo = createCustomersRepository(db);
  return repo.fetchSelect();
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
  const repo = createCustomersRepository(db);
  const rows = await repo.fetchFiltered(query);
  return rows.map(toFormattedCustomersTableRow);
}

export async function readTotalCustomersCountAction(): Promise<number> {
  const db = getDB();
  const repo = createCustomersRepository(db);
  return repo.fetchTotalCount();
}
