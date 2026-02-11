import type { AuthUserCreateDto } from "@/modules/auth/application/auth-user/dtos/requests/auth-user-create.dto";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { makeAppError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";

/**
 * Validates an AuthUserCreateDto to ensure it satisfies the minimum invariants
 * required for persistence.
 *
 * @remarks
 * This is intended to act as a “final gate” at the domain/application → infrastructure
 * boundary, right before DAL operations.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: keep aligned with other validators
export function validateAuthUserCreateDto(
  dto: AuthUserCreateDto,
): Result<AuthUserCreateDto, AppError> {
  if (!dto.email || dto.email.trim().length === 0) {
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

  if (!dto.email.includes("@")) {
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

  if (!dto.username || dto.username.trim().length === 0) {
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

  if (!dto.password || dto.password.length === 0) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "missing_password_hash",
        message: "auth.validation.password_hash_required",
        metadata: {
          field: "password",
          reason: "Password hash must be present for persistence",
        },
      }),
    );
  }

  if (!dto.role) {
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

  return Ok(dto);
}
