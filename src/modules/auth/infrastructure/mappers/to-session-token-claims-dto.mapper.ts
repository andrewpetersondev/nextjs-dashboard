import "server-only";

import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";
import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/types/session-jwt-claims.transport";
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
export function toSessionTokenClaimsDto(
  jwtClaims: SessionJwtClaimsTransport,
): Result<SessionTokenClaimsDto, AppError> {
  const role = parseUserRole(jwtClaims.role);

  if (!role) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: `Invalid role value: ${jwtClaims.role}`,
        message: "session.claims.invalid_role",
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
