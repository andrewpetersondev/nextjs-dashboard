import type { ReadSessionOutcomeDto } from "@/modules/auth/application/session/dtos/read-session-outcome.dto";
import {
  getSessionTimeLeftSec,
  type SessionEntity,
} from "@/modules/auth/domain/session/entities/session.entity";
import type { UnixSeconds } from "@/modules/auth/domain/session/values/auth-brands.value";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Builds a ReadSessionOutcomeDto from a SessionEntity.
 *
 * @remarks
 * This builder is intentionally strict:
 * if the session is already expired (negative time left), upstream should have
 * handled it and terminated/cleared the session.
 *
 * Non-throwing: returns a Result so request flows can degrade gracefully.
 */
export function buildReadSessionOutcome(
  session: SessionEntity,
  nowSec: UnixSeconds,
): Result<Readonly<ReadSessionOutcomeDto>, AppError> {
  const timeLeftSec = getSessionTimeLeftSec(session, nowSec);

  if (timeLeftSec < 0) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: `Invalid session: computed timeLeftSec is negative (${String(timeLeftSec)})`,
        message: "Invalid session state",
        metadata: {
          policy: "session",
          reason: "negative_time_left_sec",
        },
      }),
    );
  }

  return Ok({
    expiresAtSec: session.expiresAt,
    id: session.userId,
    issuedAtSec: session.issuedAt,
    role: session.role,
    timeLeftSec,
  });
}
