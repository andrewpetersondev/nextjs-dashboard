import "server-only";

import type { SessionTokenCodecContract } from "@/modules/auth/server/application/types/contracts/session-token-codec.contract";
import {
  ONE_SECOND_MS,
  SESSION_DURATION_MS,
} from "@/modules/auth/shared/domain/session/session.policy";
import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

export async function issueSessionToken(
  jwt: SessionTokenCodecContract,
  input: Readonly<{
    role: UserRole;
    sessionStart: number;
    userId: UserId;
  }>,
): Promise<Result<{ expiresAtMs: number; token: string }, AppError>> {
  const now = Date.now();
  const expiresAtMs = now + SESSION_DURATION_MS;

  const claims = {
    exp: Math.floor(expiresAtMs / ONE_SECOND_MS),
    expiresAt: expiresAtMs,
    iat: Math.floor(now / ONE_SECOND_MS),
    role: input.role,
    sessionStart: input.sessionStart,
    userId: input.userId,
  };

  const encodedResult = await jwt.encode(claims, expiresAtMs);

  if (!encodedResult.ok) {
    return Err(encodedResult.error);
  }

  return Ok({ expiresAtMs, token: encodedResult.value });
}
