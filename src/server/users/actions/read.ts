"use server";

import { USER_ERROR_MESSAGES } from "@/features/users/messages";
import { getDB } from "@/server/db/connection";
import { logger } from "@/server/logging/logger";
import { fetchUserById } from "@/server/users/dal/dal";
import type { UserDto } from "@/server/users/dto";
import { toUserId } from "@/shared/brands/domain-brands";

/**
 * Fetches a user by plain string id for UI consumption.
 */
export async function readUserAction(id: string): Promise<UserDto | null> {
  const db = getDB();
  try {
    return await fetchUserById(db, toUserId(id));
  } catch (error) {
    logger.error({
      context: "readUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.READ_FAILED,
    });
    return null;
  }
}
