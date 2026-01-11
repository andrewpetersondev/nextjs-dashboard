import type { SessionIdentityDto } from "@/modules/auth/application/dtos/session-identity.dto";

export type ReadSessionOutcomeDto = SessionIdentityDto & {
  readonly expiresAt: number;
  readonly issuedAt: number;
  // Use seconds across the stack to avoid ms/sec confusion
  readonly timeLeftSec: number;
};
