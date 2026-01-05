"use server";
import { createUserService } from "@/modules/users/application/services/factories/user-service.factory";
import type { UserDto } from "@/modules/users/domain/dto/user.dto";
import { getAppDb } from "@/server/db/db.connection";
import { toUserId } from "@/shared/branding/converters/id-converters";

/**
 * Fetches a user by plain string id for UI consumption.
 */
export async function readUserAction(id: string): Promise<UserDto | null> {
  const db = getAppDb();
  const service = createUserService(db);
  return await service.findUserById(toUserId(id));
}
