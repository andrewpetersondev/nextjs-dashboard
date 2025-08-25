"use server";

import { getDB } from "@/server/db/connection";
import { fetchUsersPages } from "@/server/users/dal";

/**
 * Server action to fetch the total number of user pages.
 */
export async function readUsersPagesAction(
  query: string = "",
): Promise<number> {
  const db = getDB();
  return await fetchUsersPages(db, query);
}
