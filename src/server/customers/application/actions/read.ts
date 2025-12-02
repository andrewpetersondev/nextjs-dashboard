"use server";

import type { CustomerField } from "@/features/customers/domain/types";
import { createCustomersRepository } from "@/server/customers/infrastructure/repository/customer.repository";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Server action to read customers for select inputs.
 * Maps server DTOs to feature-level fields at the actions boundary.
 */
export async function readCustomersAction(): Promise<CustomerField[]> {
  const db = getAppDb();
  const repo = createCustomersRepository(db);
  const rows = await repo.fetchSelect();
  return rows.map((r) => ({ id: r.id, name: r.name }));
}
