"use server";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { toNullable } from "@/shared/results/result";

/**
 * Server action to fetch the total number of user pages.
 */
export async function readUsersPageCountAction(
  query: string = "",
): Promise<number> {
  const db = getAppDb();
  const service = createUserService(db);
  const result = await service.readUserPageCount(query);
  return toNullable(result) ?? 0;
}
