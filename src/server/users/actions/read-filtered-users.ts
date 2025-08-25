"use server";

import { getDB } from "@/server/db/connection";
import { fetchFilteredUsers } from "@/server/users/dal";
import type { UserDto } from "@/server/users/dto";

/**
 * Server action to fetch filtered users for the users table.
 */
export async function readFilteredUsersAction(
  query: string = "",
  currentPage: number = 1,
): Promise<UserDto[]> {
  const db = getDB();
  return await fetchFilteredUsers(db, query, currentPage);
}
