"use server";

import type { UserDto } from "@/features/users/lib/dto";
import { USER_ERROR_MESSAGES } from "@/features/users/lib/messages";
import { getAppDb } from "@/server/db/db.connection";
import { fetchUserById } from "@/server/users/dal/fetch-user-by-id";
import { toUserId } from "@/shared/domain/id-converters";
import { sharedLogger } from "@/shared/logging/logger.shared";

/**
 * Fetches a user by plain string id for UI consumption.
 */
export async function readUserAction(id: string): Promise<UserDto | null> {
  const db = getAppDb();
  try {
    return await fetchUserById(db, toUserId(id));
  } catch (error) {
    sharedLogger.error({
      context: "readUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.READ_FAILED,
    });
    return null;
  }
}
