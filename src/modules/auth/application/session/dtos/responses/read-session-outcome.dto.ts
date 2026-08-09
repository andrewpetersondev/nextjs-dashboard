import type { SessionPrincipalDto } from "@/modules/auth/application/session/dtos/responses/session-principal.dto";
import type {
	TimeDeltaSeconds,
	UnixSeconds,
} from "@/modules/auth/domain/session/value-objects/auth-brands.value";

// TODO: this is the SessionEntity minus userId (instead of userId it has id: UserId) and role plus timeLeftSec
/**
 * A verified session as the UI needs it: who, until when, and how long is left.
 *
 * `timeLeftSec` is a signed `TimeDeltaSeconds` and can be negative — a session
 * read just after expiry still produces this shape rather than an error, so
 * callers must check the sign rather than assume a positive remainder.
 */
export type ReadSessionOutcomeDto = SessionPrincipalDto & {
	readonly expiresAtSec: UnixSeconds;
	readonly issuedAtSec: UnixSeconds;
	// Use seconds across the stack to avoid ms/sec confusion
	readonly timeLeftSec: TimeDeltaSeconds;
};
