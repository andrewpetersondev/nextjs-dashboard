import { describe, expect, it } from "vitest";
import { jwtToSessionTokenClaimsDto } from "@/modules/auth/infrastructure/session/jwt-to-session-token-claims-dto.mapper";
import type { SessionJwtClaimsTransport } from "@/modules/auth/infrastructure/session/types/session-jwt-claims.transport";

/**
 * Unit tests for jwtToSessionTokenClaimsDto.
 *
 * Transformation: SessionJwtClaimsTransport (infrastructure) → SessionTokenClaimsDto (application)
 *
 * The interesting behavior is `auth_time`: it is the only optional claim on the
 * wire, because tokens minted before the absolute-ceiling work don't carry it.
 * Rejecting those would have logged every live session out on deploy, so the
 * mapper falls back to `iat` — the value `auth_time` would have had for a session
 * that has never rotated.
 */

const ISSUED_AT = 1_800_000_000;
const AUTHENTICATED_AT = 1_799_000_000;

function makeJwtClaims(
	overrides: Partial<SessionJwtClaimsTransport> = {},
): SessionJwtClaimsTransport {
	return {
		exp: ISSUED_AT + 900,
		iat: ISSUED_AT,
		jti: "00000000-0000-4000-8000-000000000001",
		nbf: ISSUED_AT,
		role: "USER",
		sid: "00000000-0000-4000-8000-000000000002",
		sub: "00000000-0000-4000-8000-000000000003",
		...overrides,
	};
}

describe("jwtToSessionTokenClaimsDto", () => {
	it("carries auth_time through when the claim is present", () => {
		const dto = jwtToSessionTokenClaimsDto(
			makeJwtClaims({ auth_time: AUTHENTICATED_AT }),
		);

		// Distinct from iat — this token has been rotated since authentication.
		expect(dto.authTime).toBe(AUTHENTICATED_AT);
		expect(dto.iat).toBe(ISSUED_AT);
	});

	it("falls back to iat for legacy tokens that predate the claim", () => {
		const dto = jwtToSessionTokenClaimsDto(makeJwtClaims());

		expect(dto.authTime).toBe(ISSUED_AT);
	});

	it("maps the remaining claims verbatim", () => {
		const claims = makeJwtClaims({ auth_time: AUTHENTICATED_AT });

		expect(jwtToSessionTokenClaimsDto(claims)).toEqual({
			authTime: AUTHENTICATED_AT,
			exp: claims.exp,
			iat: claims.iat,
			jti: claims.jti,
			nbf: claims.nbf,
			role: "USER",
			sid: claims.sid,
			sub: claims.sub,
		});
	});
});
