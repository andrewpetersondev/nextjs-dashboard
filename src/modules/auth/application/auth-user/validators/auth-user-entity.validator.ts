import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Validates an AuthUserEntity to ensure it satisfies domain invariants.
 *
 * This validator acts as a boundary guard, ensuring that entities crossing
 * from infrastructure to application/domain layers are well-formed.
 *
 * @param entity - The auth user entity to validate.
 * @returns A Result containing the validated entity or an AppError.
 *
 * @remarks
 * Domain invariants checked:
 * - Email must contain '@' symbol (basic format check)
 * - Email must not be empty
 * - Username must not be empty
 * - User ID must be present
 * - Role must be valid
 * - Password hash must be present (for authentication entities)
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <FIX LATER>
export function validateAuthUserEntity(
  entity: AuthUserEntity,
): Result<AuthUserEntity, AppError> {
  // Validate email format (basic check)
  if (!entity.email || entity.email.trim().length === 0) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "empty_email",
        message: "auth.validation.email_required",
        metadata: {
          field: "email",
          reason: "Email cannot be empty",
        },
      }),
    );
  }

  if (!entity.email.includes("@")) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "invalid_email_format",
        message: "auth.validation.invalid_email",
        metadata: {
          field: "email",
          reason: "Email must contain @ symbol",
        },
      }),
    );
  }

  // Validate username
  if (!entity.username || entity.username.trim().length === 0) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "empty_username",
        message: "auth.validation.username_required",
        metadata: {
          field: "username",
          reason: "Username cannot be empty",
        },
      }),
    );
  }

  // Validate user ID
  if (!entity.id) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "missing_user_id",
        message: "auth.validation.user_id_required",
        metadata: {
          field: "id",
          reason: "User ID must be present",
        },
      }),
    );
  }

  // Validate password hash (for authentication entities)
  if (!entity.password || entity.password.length === 0) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "missing_password_hash",
        message: "auth.validation.password_hash_required",
        metadata: {
          field: "password",
          reason: "Password hash must be present for authentication",
        },
      }),
    );
  }

  // Validate role
  if (!entity.role) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "missing_role",
        message: "auth.validation.role_required",
        metadata: {
          field: "role",
          reason: "User role must be present",
        },
      }),
    );
  }

  // All validations passed
  return Ok(entity);
}
