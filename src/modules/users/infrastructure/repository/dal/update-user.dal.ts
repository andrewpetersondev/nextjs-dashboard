import "server-only";
import { schema } from "@database/schema/schema.aggregate";
import { eq } from "drizzle-orm";
import type {
	UpdateUserProps,
	UserEntity,
} from "@/modules/users/domain/entities/user.entity";
import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import { toUserEntity } from "@/modules/users/infrastructure/mappers/to-user-entity.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { normalizeUnknownError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

/**
 * Updates a user in the database with the provided patch.
 * Always maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - The database instance.
 * @param id - The user's branded UserId.
 * @param patch - An object containing the fields to update.
 * @returns The updated user as UserDto, or null if no changes or update failed.
 */
export async function updateUserDal(
	db: AppDatabase,
	id: UserId,
	patch: UpdateUserProps,
): Promise<Result<UserEntity | null, AppError>> {
	// Defensive: No update if patch is empty
	if (Object.keys(patch).length === 0) {
		return Ok(null);
	}
	try {
		// Always fetch raw DB row, then map to UserEntity for type safety
		const [userRow] = await db
			.update(schema.users)
			.set(patch)
			.where(eq(schema.users.id, id))
			.returning();

		if (!userRow) {
			return Ok(null);
		}

		// Map raw DB row to UserEntity (brands id/role)
		return Ok(toUserEntity(userRow));
	} catch (error) {
		logger.error("Failed to update user.", {
			context: "updateUserDal",
			error,
			id,
			patch,
		});
		return Err(normalizeUnknownError(error, APP_ERROR_KEYS.database));
	}
}
