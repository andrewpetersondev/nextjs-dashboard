"use server";

import { getAppDb } from "@/server/db/db.connection";

import { fetchUsersPages } from "@/server/users/infrastructure/dal/fetch-users-pages";

/**
 * Server action to fetch the total number of user pages.
 */
export async function readUsersPagesAction(query = ""): Promise<number> {
  const db = getAppDb();
  return await fetchUsersPages(db, query);
}
