"use server";
import type { UserDto } from "@/modules/users/application/dtos/user.dto";
import { toUserId } from "@/modules/users/domain/user-id.mappers";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { unwrapOrNull } from "@/shared/core/result/result";

/**
 * Fetches a user by plain string id for UI consumption.
 */
export async function readUserAction(id: string): Promise<UserDto | null> {
  const db = getAppDb();
  const service = createUserService(db);
  const result = await service.readUserById(toUserId(id));
  return unwrapOrNull(result);
}
