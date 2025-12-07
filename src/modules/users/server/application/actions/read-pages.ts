"use server";
import { createUserService } from "@/modules/users/server/application/services/factories/user-service.factory";
import { getAppDb } from "@/server-core/db/db.connection";

/**
 * Server action to fetch the total number of user pages.
 */
export async function fetchUsersPageCountAction(query = ""): Promise<number> {
  const db = getAppDb();
  const service = createUserService(db);
  return await service.getUserPageCount(query);
}
