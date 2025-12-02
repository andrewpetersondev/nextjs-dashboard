"use server";

import { fetchUsersPages } from "@/modules/users/server/infrastructure/dal/fetch-users-pages";
import { getAppDb } from "@/server/db/db.connection";

/**
 * Server action to fetch the total number of user pages.
 */
export async function readUsersPagesAction(query = ""): Promise<number> {
  const db = getAppDb();
  return await fetchUsersPages(db, query);
}
