import "server-only";

import type { SessionTokenClaims } from "@/modules/auth/application/dtos/session-token.claims";
import type { SessionJwtClaims } from "@/modules/auth/infrastructure/serialization/session-jwt.claims";
import { parseUserRole } from "@/shared/domain/user/user-role.parser";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Converts infrastructure JWT claims to application-layer session token claims.
 *
 * This mapper bridges infrastructure (JWT with role as string) and application
 * layers (SessionTokenClaims with role as UserRole enum).
 *
 * @param jwtClaims - Raw JWT claims from token decode
 * @returns Application-layer claims with typed role, or error if role is invalid
 */
export function toSessionTokenClaims(
  jwtClaims: SessionJwtClaims,
): Result<SessionTokenClaims, AppError> {
  const role = parseUserRole(jwtClaims.role);

  if (!role) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: `Invalid role value: ${jwtClaims.role}`,
        message: "Invalid role in JWT claims",
        //       todo: in the future refactor makeAppError metadata so I can use  metadata: { sub:
        //        jwtClaims.sub },
        metadata: {},
      }),
    );
  }

  return Ok({
    exp: jwtClaims.exp,
    iat: jwtClaims.iat,
    role,
    sub: jwtClaims.sub,
  });
}
