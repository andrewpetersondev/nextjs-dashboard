import type { UserRow } from "@database/schema/users";
import type { AuthenticatedUserDto } from "@/modules/auth/application/auth-user/dtos/responses/authenticated-user.dto";
import {
	UPDATE_SESSION_OUTCOME_REASON,
	type UpdateSessionSuccessDto,
} from "@/modules/auth/application/session/dtos/responses/update-session-outcome.dto";
import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";
import type { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { toUserId } from "@/modules/users/domain/user-id.mappers";
import { toHash } from "@/server/crypto/hashing/hashing.value";

/**
 * Canonical, fake test data reused across unit tests.
 *
 * One source of truth for the user id / email / password literals that were
 * previously copy-pasted into every spec. None of this is real.
 */
export const TEST_USER_ID = toUserId("550e8400-e29b-41d4-a716-446655440000");
export const TEST_EMAIL = "test@example.com";
export const TEST_USERNAME = "testuser";
/** Plaintext that satisfies the password policy (for action/service inputs). */
export const TEST_PASSWORD = "TestPassword123!";
/** A bcrypt-shaped string, branded as `Hash`. */
export const TEST_PASSWORD_HASH = toHash("$2a$10$hashedpassword");

/** A database row (`UserRow`) with overridable fields. */
export function makeUserRow(overrides: Partial<UserRow> = {}): UserRow {
	return {
		email: TEST_EMAIL,
		id: TEST_USER_ID,
		password: TEST_PASSWORD_HASH,
		role: "USER",
		sensitiveData: "cantTouchThis",
		username: TEST_USERNAME,
		...overrides,
	};
}

/** A domain `UserEntity` with overridable fields. */
export function makeUserEntity(
	overrides: Partial<UserEntity> = {},
): UserEntity {
	return {
		email: TEST_EMAIL,
		id: TEST_USER_ID,
		password: TEST_PASSWORD_HASH,
		role: "USER",
		sensitiveData: "some-data",
		username: TEST_USERNAME,
		...overrides,
	};
}

/** An auth-domain `AuthUserEntity` (no `sensitiveData`). */
export function makeAuthUserEntity(
	overrides: Partial<AuthUserEntity> = {},
): AuthUserEntity {
	return {
		email: TEST_EMAIL,
		id: TEST_USER_ID,
		password: TEST_PASSWORD_HASH,
		role: "USER",
		username: TEST_USERNAME,
		...overrides,
	};
}

/** An `AuthenticatedUserDto` (no password — the security boundary stripped it). */
export function makeAuthenticatedUserDto(
	overrides: Partial<AuthenticatedUserDto> = {},
): AuthenticatedUserDto {
	return {
		email: TEST_EMAIL,
		id: TEST_USER_ID,
		role: "USER",
		username: TEST_USERNAME,
		...overrides,
	};
}

/** A successful `UpdateSessionSuccessDto` (e.g. a rotated session). */
export function makeUpdateSessionSuccessDto(
	overrides: Partial<UpdateSessionSuccessDto> = {},
): UpdateSessionSuccessDto {
	return {
		expiresAtMs: 1_700_000_000_000,
		reason: UPDATE_SESSION_OUTCOME_REASON.rotated,
		refreshed: true,
		role: "USER",
		userId: TEST_USER_ID,
		...overrides,
	};
}
