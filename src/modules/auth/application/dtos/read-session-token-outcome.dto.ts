import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";

export type ReadSessionTokenOutcomeDto =
  | { kind: "missing_token" }
  | { kind: "invalid_token"; didCleanup: boolean }
  | {
      kind: "decoded";
      decoded: SessionTokenClaimsDto;
    };
