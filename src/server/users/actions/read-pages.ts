"use server";

import { getDB } from "@/server/db/connection";

import { fetchUsersPages } from "@/server/users/dal/fetch-users-pages";

/**
 * Server action to fetch the total number of user pages.
 */
export async function readUsersPagesAction(query = ""): Promise<number> {
  const db = getDB();
  return await fetchUsersPages(db, query);
}
