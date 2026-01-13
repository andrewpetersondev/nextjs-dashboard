import type { SessionPrincipalDto } from "@/modules/auth/application/dtos/session-principal.dto";

// TODO: this is the SessionEntity minus userId (instead of userId it has id: UserId) and role plus timeLeftSec
export type ReadSessionOutcomeDto = SessionPrincipalDto & {
  readonly expiresAt: number;
  readonly issuedAt: number;
  // Use seconds across the stack to avoid ms/sec confusion
  readonly timeLeftSec: number;
};
