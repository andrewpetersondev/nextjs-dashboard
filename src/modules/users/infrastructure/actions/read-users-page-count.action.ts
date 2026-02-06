"use server";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Server action to fetch the total number of user pages.
 */
export async function readUsersPageCountAction(query = ""): Promise<number> {
  const db = getAppDb();
  const service = createUserService(db);
  return await service.readUserPageCount(query);
}
