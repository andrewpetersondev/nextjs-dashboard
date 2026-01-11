import "server-only";
import type { ReadSessionOutcomeDto } from "@/modules/auth/application/dtos/read-session-outcome.dto";
import type { SessionEntity } from "@/modules/auth/domain/entities/session.entity";
import { getSessionTimeLeftMs } from "@/modules/auth/domain/entities/session.entity";

/**
 * Maps a SessionEntity to a ReadSessionOutcomeDto.
 *
 * Includes computed session state (timeLeftMs) for client visibility into
 * session freshness and remaining lifetime.
 */
export function toReadSessionOutcome(
  session: SessionEntity,
  now: number = Date.now(),
): ReadSessionOutcomeDto {
  return {
    expiresAt: session.expiresAt,
    id: session.userId,
    issuedAt: session.issuedAt,
    role: session.role,
    timeLeftMs: getSessionTimeLeftMs(session, now),
  };
}
