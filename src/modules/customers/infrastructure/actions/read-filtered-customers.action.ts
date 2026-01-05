"use server";

import { toFormattedCustomersTableRow } from "@/modules/customers/domain/mappers";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import { createCustomersRepository } from "@/modules/customers/infrastructure/repository/customer.repository";
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
