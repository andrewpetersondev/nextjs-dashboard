"use server";

import { createCustomersRepository } from "@/server/customers/repo";
import { getDB } from "@/server/db/connection";

export async function readTotalCustomersCountAction(): Promise<number> {
  const db = getDB();
  const repo = createCustomersRepository(db);
  return await repo.fetchTotalCount();
}
