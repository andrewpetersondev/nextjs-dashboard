import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";
import type {
  TimeDeltaSeconds,
  UnixSeconds,
} from "@/modules/auth/domain/values/auth-brands.value";

// TODO: this is the SessionEntity minus userId (instead of userId it has id: UserId) and role plus timeLeftSec
export type ReadSessionOutcomeDto = SessionPrincipalDto & {
  readonly expiresAtSec: UnixSeconds;
  readonly issuedAtSec: UnixSeconds;
  // Use seconds across the stack to avoid ms/sec confusion
  readonly timeLeftSec: TimeDeltaSeconds;
};
