"use server";

import type { UserDto } from "@/modules/users/domain/user.dto";
import { fetchFilteredUsers } from "@/modules/users/server/infrastructure/dal/fetch-filtered-users";
import { getAppDb } from "@/server-core/db/db.connection";

/**
 * Server action to fetch filtered users for the users table.
 */
export async function readFilteredUsersAction(
  query = "",
  currentPage = 1,
): Promise<UserDto[]> {
  const db = getAppDb();
  return await fetchFilteredUsers(db, query, currentPage);
}
