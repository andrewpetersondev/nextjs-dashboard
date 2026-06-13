"use server";
import { requireAdmin } from "@/modules/auth/presentation/session/session-access.guard";
import type { UserDto } from "@/modules/users/application/dtos/user.dto";
import { toUserId } from "@/modules/users/domain/user-id.mappers";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { unwrapOrNull } from "@/shared/core/result/result";

/**
 * Fetches a user by plain string id for UI consumption.
 */
export async function readUserAction(id: string): Promise<UserDto | null> {
	// Authorization: user records are admin-only (PII). This action is a
	// "use server" endpoint, so it must guard itself, not rely on the route.
	await requireAdmin();

	const db = getAppDb();
	const service = createUserService(db);
	const result = await service.readUserById(toUserId(id));
	return unwrapOrNull(result);
}
