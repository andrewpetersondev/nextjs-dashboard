import "server-only";
import { schema } from "@database/schema/schema.aggregate";
import { eq } from "drizzle-orm";
import type { UserEntity } from "@/modules/users/domain/entities/user.entity";
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
 * Deletes a user by branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - Database instance (Drizzle)
 * @param userId - UserId (branded)
 * @returns UserDto if deleted, otherwise null
 */
export async function deleteUserDal(
	db: AppDatabase,
	userId: UserId, // Use branded UserId for strict typing
): Promise<Result<UserEntity | null, AppError>> {
	try {
		// Fetch raw DB row, not UserEntity
		const [deletedRow] = await db
			.delete(schema.users)
			.where(eq(schema.users.id, userId))
			.returning();

		if (!deletedRow) {
			return Ok(null);
		}

		// Map raw DB row to UserEntity for type safety
		return Ok(toUserEntity(deletedRow));
	} catch (error) {
		logger.error("Failed to delete user.", {
			context: "deleteUserDal",
			error,
			userId,
		});
		return Err(normalizeUnknownError(error, APP_ERROR_KEYS.database));
	}
}
