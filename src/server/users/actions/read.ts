"use server";

import { getDB } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { fetchUserById } from "@/server/users/dal/fetch-user-by-id";
import { toUserId } from "@/shared/brands/mappers";
import type { UserDto } from "@/shared/users/dto";
import { USER_ERROR_MESSAGES } from "@/shared/users/messages";

/**
 * Fetches a user by plain string id for UI consumption.
 */
export async function readUserAction(id: string): Promise<UserDto | null> {
  const db = getDB();
  try {
    return await fetchUserById(db, toUserId(id));
  } catch (error) {
    serverLogger.error({
      context: "readUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.READ_FAILED,
    });
    return null;
  }
}
