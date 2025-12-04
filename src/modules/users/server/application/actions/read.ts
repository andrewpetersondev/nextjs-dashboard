"use server";

import type { UserDto } from "@/modules/users/domain/user.dto";
import { USER_ERROR_MESSAGES } from "@/modules/users/domain/user.messages";
import { fetchUserById } from "@/modules/users/server/infrastructure/dal/fetch-user-by-id";
import { getAppDb } from "@/server-core/db/db.connection";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { logger } from "@/shared/logging/infrastructure/logging.client";

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
