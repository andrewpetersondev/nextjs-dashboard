"use server";
import { requireAdmin } from "@/modules/auth/presentation/session/guards/session-access.guard";
import type { UserDto } from "@/modules/users/application/dtos/user.dto";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { unwrapOrNull } from "@/shared/core/result/result";

/**
 * Server action to fetch filtered users for the users table.
 */
export async function readFilteredUsersAction(
	query: string = "",
	currentPage: number = 1,
): Promise<UserDto[]> {
	// Authorization: user records are admin-only (PII). This action is a
	// "use server" endpoint, so it must guard itself, not rely on the route.
	await requireAdmin();

	const db = getAppDb();
	const service = createUserService(db);
	const result = await service.readFilteredUsers(query, currentPage);
	return unwrapOrNull(result) ?? [];
}
