"use server";

import { toFormattedCustomersTableRow } from "@/features/customers/lib/mapToViewModel";
import type { FormattedCustomersTableRow } from "@/features/customers/types";
import { createCustomersRepository } from "@/server/customers/repo";
import { getDB } from "@/server/db/connection";

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
