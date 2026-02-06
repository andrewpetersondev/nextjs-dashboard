import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";
import { EmailSchema } from "@/shared/validation/zod/email.schema";
import { UsernameSchema } from "@/shared/validation/zod/username.schema";

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
  const emailResult = EmailSchema.safeParse(entity.email);

  if (!emailResult.success) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "invalid_email",
        message: "auth.validation.invalid_email",
        metadata: {
          field: "email",
          reason: "Email must be a valid, normalized email address",
        },
      }),
    );
  }

  const normalizedEmail = emailResult.data;

  const usernameResult = UsernameSchema.safeParse(entity.username);

  if (!usernameResult.success) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "invalid_username",
        message: "auth.validation.username_required",
        metadata: {
          field: "username",
          reason: "Username must be present and satisfy username policy",
        },
      }),
    );
  }

  const normalizedUsername = usernameResult.data;

  // Normalize at the boundary so infra/domain entities always use canonical identity values.
  // This keeps auth flows resilient even if legacy rows exist in the database.
  const normalizedEntity: AuthUserEntity = {
    ...entity,
    email: normalizedEmail,
    username: normalizedUsername,
  };

  // Validate user ID
  if (!normalizedEntity.id) {
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
  if (!normalizedEntity.password || normalizedEntity.password.length === 0) {
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
  if (!normalizedEntity.role) {
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
  return Ok(normalizedEntity);
}
