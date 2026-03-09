import "server-only";
import { schema } from "@database/schema/schema.aggregate";
import type { NewUserRow } from "@database/schema/users";
import type {
	CreateUserProps,
	UserEntity,
} from "@/modules/users/domain/entities/user.entity";
import { toUserEntity } from "@/modules/users/infrastructure/mappers/to-user-entity.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { normalizeUnknownError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

/**
 * Inserts a new user record into the database.
 * @param params - User creation parameters.
 * @returns The created user as UserDto, or null if creation failed.
 * @param db
 */
export async function createUserDal(
	db: AppDatabase,
	params: CreateUserProps,
): Promise<Result<UserEntity | null, AppError>> {
	const { username, email, password, role } = params;

	try {
		// Explicitly type the insert object as NewUserRow (schema type)
		// This ensures we match the shape required by Drizzle's $inferInsert
		const newUser: NewUserRow = {
			email,
			password,
			role,
			username,
		};

		const [userRow] = await db.insert(schema.users).values(newUser).returning();
		return Ok(userRow ? toUserEntity(userRow) : null);
	} catch (error) {
		logger.error("Failed to create a user in the database.", {
			context: "createUserDal",
			email,
			error,
			role,
			username,
		});
		return Err(normalizeUnknownError(error, APP_ERROR_KEYS.database));
	}
}
