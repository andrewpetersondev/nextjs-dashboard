"use server";
import type { UserDto } from "@/modules/users/application/dtos/user.dto";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { unwrapOrNull } from "@/shared/results/result";

/**
 * Fetches a user by plain string id for UI consumption.
 */
export async function readUserAction(id: string): Promise<UserDto | null> {
  const db = getAppDb();
  const service = createUserService(db);
  const result = await service.readUserById(toUserId(id));
  return unwrapOrNull(result);
}
