import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/responses/session-token-claims.dto";

/**
 * Every way reading a session token can turn out, as a discriminated union on
 * `kind`.
 *
 * Only the four failure kinds are reported as outcomes rather than errors —
 * an absent or unreadable token is an ordinary anonymous visit, not a fault.
 * `didCleanup` says whether a bad cookie was cleared as a side effect, so it is
 * absent from `missing_token` (nothing to clear) and from `decoded` (nothing
 * wrong).
 */
export type ReadSessionTokenOutcomeDto =
	| Readonly<{ kind: "missing_token" }>
	| Readonly<{ didCleanup: boolean; kind: "invalid_token" }>
	| Readonly<{ didCleanup: boolean; kind: "invalid_claims" }>
	| Readonly<{ didCleanup: boolean; kind: "invalid_claims_semantics" }>
	| Readonly<{
			decoded: SessionTokenClaimsDto;
			kind: "decoded";
	  }>;
