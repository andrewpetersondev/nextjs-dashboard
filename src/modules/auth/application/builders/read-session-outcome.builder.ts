import type { ReadSessionOutcomeDto } from "@/modules/auth/application/dtos/read-session-outcome.dto";
import {
  getSessionTimeLeftSec,
  type SessionEntity,
} from "@/modules/auth/domain/entities/session.entity";
import type { UnixSeconds } from "@/modules/auth/domain/values/auth-brands.value";

/**
 * Builds a ReadSessionOutcomeDto from a SessionEntity.
 *
 * @remarks
 * This builder is intentionally strict:
 * if the session is already expired (negative time left), upstream should have
 * handled it and terminated/cleared the session.
 *
 * @throws Error
 * Thrown when the computed time left is negative.
 */
export function buildReadSessionOutcome(
  session: SessionEntity,
  nowSec: UnixSeconds,
): Readonly<ReadSessionOutcomeDto> {
  const timeLeftSec = getSessionTimeLeftSec(session, nowSec);

  if (timeLeftSec < 0) {
    throw new Error("Invalid session: computed timeLeftSec is negative");
  }

  return {
    expiresAt: session.expiresAt,
    id: session.userId,
    issuedAt: session.issuedAt,
    role: session.role,
    timeLeftSec,
  };
}
