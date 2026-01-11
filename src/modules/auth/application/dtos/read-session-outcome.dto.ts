import type { SessionIdentityDto } from "@/modules/auth/application/dtos/session-identity.dto";

export type ReadSessionOutcomeDto = SessionIdentityDto & {
  readonly expiresAt: number;
  readonly issuedAt: number;
  readonly timeLeftMs: number;
};
