"use server";

import type { CustomerField } from "@/features/customers/types";
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
