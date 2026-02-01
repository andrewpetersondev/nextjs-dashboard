// NEW: application/auth-user/validators/auth-user-entity.validator.ts
import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export function validateAuthUserEntity(
  entity: AuthUserEntity,
): Result<AuthUserEntity, AppError> {
  // Validate domain invariants
  if (!entity.email.includes("@")) {
    return Err(makeAppError('validation', { ... }));
  }
  return Ok(entity);
}
