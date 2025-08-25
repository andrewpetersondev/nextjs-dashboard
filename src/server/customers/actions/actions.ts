"use server";

import { toFormattedCustomersTableRow } from "@/features/customers/lib/mapToViewModel";
import type {
  CustomerField,
  FormattedCustomersTableRow,
} from "@/features/customers/types";
import { createCustomersRepository } from "@/server/customers/repo";
import { getDB } from "@/server/db/connection";

/**
 * Server action to read customers for select inputs.
 * Maps server DTOs to feature-level fields at the actions boundary.
 */
export async function readCustomersAction(): Promise<CustomerField[]> {
  const db = getDB();
  const repo = createCustomersRepository(db);
  const rows = await repo.fetchSelect();
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

/**
 * Server action to fetch filtered customers for the customers table.
 * Keeps feature-level formatting in the feature layer.
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
  return await repo.fetchTotalCount();
}
