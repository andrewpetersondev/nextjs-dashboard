import "server-only";
import type { ReadSessionOutcomeDto } from "@/modules/auth/application/dtos/read-session-outcome.dto";
import type { SessionEntity } from "@/modules/auth/domain/entities/session.entity";
import { getSessionTimeLeftSec } from "@/modules/auth/domain/entities/session.entity";
import { nowInSeconds } from "@/shared/constants/time.constants";

/**
 * Maps a session entity to a read session outcome DTO.
 *
 * This function includes computed session state, such as the time left until
 * expiration, to provide the client with visibility into session freshness.
 *
 * @param session - The session entity from the domain layer.
 * @param nowSec - The current time in seconds (defaults to now).
 * @returns The session outcome DTO.
 */
export function toReadSessionOutcome(
  session: SessionEntity,
  nowSec: number = nowInSeconds(),
): Readonly<ReadSessionOutcomeDto> {
  return {
    expiresAt: session.expiresAt,
    id: session.userId,
    issuedAt: session.issuedAt,
    role: session.role,
    timeLeftSec: getSessionTimeLeftSec(session, nowSec),
  } as const;
}
