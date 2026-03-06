import "server-only";
import { users } from "@database/schema/users";
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
 * Retrieves a user from the database by branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - The database instance.
 * @param id - The user's branded UserId.
 * @returns The user as UserDto, or null if not found.
 */
export async function readUserDal(
	db: AppDatabase,
	id: UserId, // Use branded UserId for strict typing
): Promise<Result<UserEntity | null, AppError>> {
	try {
		// Fetch raw DB row, not UserEntity
		const [userRow] = await db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);

		if (!userRow) {
			return Ok(null);
		}

		// Map raw DB row to UserEntity for type safety (brands id/role)
		return Ok(toUserEntity(userRow));
	} catch (error) {
		logger.error("Failed to read user by ID.", {
			context: "readUserDal",
			error,
			id,
		});
		return Err(normalizeUnknownError(error, APP_ERROR_KEYS.database));
	}
}
