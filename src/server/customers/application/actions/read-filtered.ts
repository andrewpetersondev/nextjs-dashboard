"use server";

import type { FormattedCustomersTableRow } from "@/features/customers/domain/types";
import { toFormattedCustomersTableRow } from "@/features/customers/lib/mapToViewModel";
import { createCustomersRepository } from "@/server/customers/infrastructure/repository";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Server action to fetch filtered customers for the customers table.
 * Keeps feature-level formatting in the feature layer.
 */
export async function readFilteredCustomersAction(
  query = "",
): Promise<FormattedCustomersTableRow[]> {
  const db = getAppDb();
  const repo = createCustomersRepository(db);
  const rows = await repo.fetchFiltered(query);
  return rows.map(toFormattedCustomersTableRow);
}
