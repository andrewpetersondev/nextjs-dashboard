"use server";

import type { UserDto } from "@/features/users/lib/dto";
import { getAppDb } from "@/server/db/db.connection";
import { fetchFilteredUsers } from "@/server/users/infrastructure/dal/fetch-filtered-users";

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
