"use server";
import type { UserDto } from "@/modules/users/application/dtos/user.dto";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { unwrapOrNull } from "@/shared/results/result";

/**
 * Server action to fetch filtered users for the users table.
 */
export async function readFilteredUsersAction(
  query: string = "",
  currentPage: number = 1,
): Promise<UserDto[]> {
  const db = getAppDb();
  const service = createUserService(db);
  const result = await service.readFilteredUsers(query, currentPage);
  return unwrapOrNull(result) ?? [];
}
