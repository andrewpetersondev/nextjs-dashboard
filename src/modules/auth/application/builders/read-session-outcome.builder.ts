import "server-only";

import type { ReadSessionOutcomeDto } from "@/modules/auth/application/dtos/read-session-outcome.dto";
import type { SessionEntity } from "@/modules/auth/domain/entities/session.entity";
import { getSessionTimeLeftSec } from "@/modules/auth/domain/entities/session.entity";
import { MILLISECONDS_PER_SECOND } from "@/shared/constants/time.constants";

/**
 * Builds a ReadSessionOutcomeDto from a SessionEntity.
 *
 * Validation:
 * - Ensures computed timeLeftSec is non-negative (if negative, session is expired and should be handled upstream)
 */
export function buildReadSessionOutcome(
  session: Readonly<SessionEntity>,
  nowSec: number = Math.floor(Date.now() / MILLISECONDS_PER_SECOND),
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
  } as const;
}
