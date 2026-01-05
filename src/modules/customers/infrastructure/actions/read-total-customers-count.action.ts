"use server";

import { createCustomersRepository } from "@/modules/customers/infrastructure/repository/customer.repository";
import { getAppDb } from "@/server/db/db.connection";

export async function readTotalCustomersCountAction(): Promise<number> {
  const db = getAppDb();
  const repo = createCustomersRepository(db);
  return await repo.fetchTotalCount();
}
