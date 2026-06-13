"use server";
import { requireAdmin } from "@/modules/auth/presentation/session/session-access.guard";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { unwrapOrNull } from "@/shared/core/result/result";

/**
 * Server action to fetch the total number of user pages.
 */
export async function readUsersPageCountAction(
	query: string = "",
): Promise<number> {
	// Authorization: user records are admin-only (PII). This action is a
	// "use server" endpoint, so it must guard itself, not rely on the route.
	await requireAdmin();

	const db = getAppDb();
	const service = createUserService(db);
	const result = await service.readUserPageCount(query);
	return unwrapOrNull(result) ?? 0;
}
