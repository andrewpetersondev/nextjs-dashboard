import type { SessionTokenClaimsDto } from "@/modules/auth/application/dtos/session-token-claims.dto";

export type ReadSessionTokenOutcomeDto =
  | Readonly<{ kind: "missing_token" }>
  | Readonly<{ didCleanup: boolean; kind: "invalid_token" }>
  | Readonly<{
      decoded: SessionTokenClaimsDto;
      kind: "decoded";
    }>;
