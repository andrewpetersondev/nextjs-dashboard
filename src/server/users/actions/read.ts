"use server";

import type { UserDto } from "@/features/users/lib/dto";
import { USER_ERROR_MESSAGES } from "@/features/users/lib/messages";
import { getAppDb } from "@/server/db/db.connection";
import { fetchUserById } from "@/server/users/dal/fetch-user-by-id";
import { toUserId } from "@/shared/branding/id-converters";
import { logger } from "@/shared/logging/infra/logger.shared";

/**
 * Fetches a user by plain string id for UI consumption.
 */
export async function readUserAction(id: string): Promise<UserDto | null> {
  const db = getAppDb();
  try {
    return await fetchUserById(db, toUserId(id));
  } catch (error) {
    logger.error(USER_ERROR_MESSAGES.readFailed, {
      context: "readUserAction",
      error,
      id,
    });
    return null;
  }
}
