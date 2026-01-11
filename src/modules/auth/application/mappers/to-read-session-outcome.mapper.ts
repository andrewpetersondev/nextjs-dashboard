import "server-only";
import type { ReadSessionOutcomeDto } from "@/modules/auth/application/dtos/read-session-outcome.dto";
import type { SessionEntity } from "@/modules/auth/domain/entities/session.entity";
import { getSessionTimeLeftSec } from "@/modules/auth/domain/entities/session.entity";

/**
 * Maps a SessionEntity to a ReadSessionOutcomeDto.
 *
 * Includes computed session state (timeLeftSec) for client visibility into
 * session freshness and remaining lifetime.
 */
export function toReadSessionOutcome(
  session: SessionEntity,
  nowSec: number = Math.floor(Date.now() / 1000),
): Readonly<ReadSessionOutcomeDto> {
  return {
    expiresAt: session.expiresAt,
    id: session.userId,
    issuedAt: session.issuedAt,
    role: session.role,
    timeLeftSec: getSessionTimeLeftSec(session, nowSec),
  } as const;
}
