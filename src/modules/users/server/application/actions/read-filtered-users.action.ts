"use server";
import type { UserDto } from "@/modules/users/domain/dto/user.dto";
import { createUserService } from "@/modules/users/server/application/services/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Server action to fetch filtered users for the users table.
 */
export async function readFilteredUsersAction(
  query = "",
  currentPage = 1,
): Promise<UserDto[]> {
  const db = getAppDb();
  const service = createUserService(db);
  return await service.findUsers(query, currentPage);
}
