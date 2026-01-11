import type { SessionIdentityDto } from "@/modules/auth/domain/types/session-identity.dto";

// todo: this is the SessionEntity minus userId (instead of userId it has id: UserId) and role plus timeLeftSec
export type ReadSessionOutcomeDto = SessionIdentityDto & {
  readonly expiresAt: number;
  readonly issuedAt: number;
  // Use seconds across the stack to avoid ms/sec confusion
  readonly timeLeftSec: number;
};
