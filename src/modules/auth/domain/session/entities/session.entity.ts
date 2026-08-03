import type {
	DurationSeconds,
	TimeDeltaSeconds,
	UnixSeconds,
} from "@/modules/auth/domain/session/value-objects/auth-brands.value";
import {
	calculateAgeSec,
	calculateTimeLeftSec,
} from "@/modules/auth/domain/session/value-objects/time.value";
import type { UserId } from "@/modules/users/domain/types/user-id.brand";
import type { UserRole } from "@/shared/policies/user-role/user-role.constants";

/**
 * Represents the core session data as a domain entity.
 * This is the central source of truth for an authenticated session's state.
 *
 * @remarks
 * All timestamps are UNIX seconds (not milliseconds).
 *
 * This entity intentionally models the *session* (domain state), not the session *token*.
 * Token-specific identifiers/claims such as `sid` and `jti` live in application-layer DTOs.
 */
export type SessionEntity = Readonly<{
	/** Expiration time (UNIX seconds, matches JWT `exp`) */
	expiresAt: UnixSeconds;
	/**
	 * Issued at time of the *current token* (UNIX seconds, matches JWT `iat`).
	 *
	 * @remarks
	 * Resets on every rotation. Use {@link SessionEntity.startedAt} — not this — to
	 * reason about how old the session itself is.
	 */
	issuedAt: UnixSeconds;
	/** User role for authorization checks within the session */
	role: UserRole;
	/**
	 * When the session began — the original authentication (UNIX seconds, matches
	 * the JWT `auth_time` claim).
	 *
	 * @remarks
	 * Survives rotation, which is exactly what distinguishes it from `issuedAt` and
	 * what allows the absolute lifetime ceiling to actually bind.
	 */
	startedAt: UnixSeconds;
	/** Unique user identifier (branded UserId) */
	userId: UserId;
}>;

/**
 * Domain Logic: Calculates the remaining time until expiry (signed).
 */
export function getSessionTimeLeftSec(
	session: SessionEntity,
	nowSec: UnixSeconds,
): TimeDeltaSeconds {
	return calculateTimeLeftSec(session.expiresAt, nowSec);
}

/**
 * Domain Logic: Checks if session has expired.
 *
 * @param session - The session entity.
 * @param nowSec - Current UNIX timestamp in seconds.
 * @returns True if the session is expired.
 */
export function isSessionExpired(
	session: SessionEntity,
	nowSec: UnixSeconds,
): boolean {
	return getSessionTimeLeftSec(session, nowSec) <= 0;
}

/**
 * Domain Logic: Checks if session is approaching expiry within threshold.
 *
 * @param session - The session entity.
 * @param thresholdSec - The threshold in seconds.
 * @param nowSec - Current UNIX timestamp in seconds.
 * @returns True if the session is within the expiry threshold.
 */
export function isSessionApproachingExpiry(
	session: SessionEntity,
	thresholdSec: DurationSeconds,
	nowSec: UnixSeconds,
): boolean {
	const remaining: TimeDeltaSeconds = getSessionTimeLeftSec(session, nowSec);
	return remaining > 0 && remaining <= thresholdSec;
}

/**
 * Domain Logic: Checks if the session has exceeded its absolute maximum lifetime.
 *
 * @remarks
 * Age is measured from `startedAt` (original authentication), *not* `issuedAt`.
 * Measuring from `issuedAt` was the bug this ceiling used to have: rotation mints a
 * fresh `iat`, so an actively used session's measured age reset every few minutes
 * and the ceiling could never be reached.
 *
 * @param session - The session entity.
 * @param maxLifetimeSec - Maximum allowed lifetime in seconds.
 * @param nowSec - Current UNIX timestamp in seconds.
 * @returns Object containing the session age and whether it exceeded the limit.
 */
export function isSessionAbsoluteLifetimeExceeded(
	session: SessionEntity,
	maxLifetimeSec: DurationSeconds,
	nowSec: UnixSeconds,
): Readonly<{ ageSec: DurationSeconds; exceeded: boolean }> {
	const ageSec: DurationSeconds = calculateAgeSec(session.startedAt, nowSec);
	return { ageSec, exceeded: ageSec > maxLifetimeSec };
}
