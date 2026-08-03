import { describe, expect, it } from "vitest";
import type { SessionTokenCodecContract } from "@/modules/auth/application/session/contracts/session-token-codec.contract";
import type { SessionTokenClaimsDto } from "@/modules/auth/application/session/dtos/responses/session-token-claims.dto";
import { SessionTokenService } from "@/modules/auth/infrastructure/session/services/session-token.service";
import { toUserId } from "@/modules/users/domain/user-id.mappers";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";
import { nowInSeconds } from "@/shared/time/time.constants";

/**
 * Unit tests for the `auth_time` behavior of SessionTokenService.
 *
 * `auth_time` is what makes the absolute session ceiling binding: rotation mints a
 * fresh `iat`, so only a claim that survives rotation can anchor session age. These
 * tests capture the claims handed to the codec rather than a signed token, so the
 * assertions are about issuance policy, not JWT mechanics.
 */

const USER_ID = toUserId("00000000-0000-4000-8000-000000000003");
const SID = "00000000-0000-4000-8000-000000000002";

/** Codec stub that records the claims it was asked to encode. */
class CapturingCodec implements SessionTokenCodecContract {
	encoded: SessionTokenClaimsDto[] = [];

	// biome-ignore lint/suspicious/useAwait: contract is async; the stub is not
	async decode(_token: string): Promise<Result<unknown, AppError>> {
		return Ok({});
	}

	// biome-ignore lint/suspicious/useAwait: contract is async; the stub is not
	async encode(
		claims: SessionTokenClaimsDto,
	): Promise<Result<string, AppError>> {
		this.encoded.push(claims);
		return Ok("signed.token.stub");
	}
}

function makeService(): {
	codec: CapturingCodec;
	service: SessionTokenService;
} {
	const codec = new CapturingCodec();
	return { codec, service: new SessionTokenService(codec) };
}

describe("SessionTokenService auth_time", () => {
	describe("issue", () => {
		it("stamps auth_time with the current time on fresh authentication", async () => {
			const { codec, service } = makeService();
			const before = nowInSeconds();

			const result = await service.issue({ role: "USER", userId: USER_ID });

			expect(result.ok).toBe(true);
			const claims = codec.encoded[0];
			expect(claims).toBeDefined();
			expect(claims?.authTime).toBeGreaterThanOrEqual(before);
			// A brand-new session: authentication and issuance are the same moment.
			expect(claims?.authTime).toBe(claims?.iat);
		});
	});

	describe("issueRotated", () => {
		it("carries the original auth_time forward while minting a fresh iat", async () => {
			const { codec, service } = makeService();
			const authTime = nowInSeconds() - 86_400; // authenticated a day ago

			const result = await service.issueRotated({
				authTime,
				role: "USER",
				sid: SID,
				userId: USER_ID,
			});

			expect(result.ok).toBe(true);
			const claims = codec.encoded[0];
			expect(claims?.authTime).toBe(authTime);
			// The token is new; the session is not.
			expect(claims?.iat).toBeGreaterThan(authTime);
			expect(claims?.sid).toBe(SID);
		});

		it("does not drift auth_time across repeated rotations", async () => {
			const { codec, service } = makeService();
			const authTime = nowInSeconds() - 86_400;

			// Each rotation feeds the next, exactly as the rotate use case does:
			// it reads authTime off the current claims and hands it straight back.
			const rotateFromLast = async (): Promise<void> => {
				await service.issueRotated({
					authTime: codec.encoded.at(-1)?.authTime ?? authTime,
					role: "USER",
					sid: SID,
					userId: USER_ID,
				});
			};

			await rotateFromLast();
			await rotateFromLast();
			await rotateFromLast();

			expect(codec.encoded).toHaveLength(3);
			for (const claims of codec.encoded) {
				expect(claims.authTime).toBe(authTime);
			}
		});
	});

	describe("validate", () => {
		const makeRawClaims = (
			overrides: Record<string, unknown> = {},
		): Record<string, unknown> => {
			const iat = nowInSeconds() - 10;
			return {
				exp: iat + 900,
				iat,
				jti: "00000000-0000-4000-8000-000000000001",
				nbf: iat,
				role: "USER",
				sid: SID,
				sub: "00000000-0000-4000-8000-000000000003",
				...overrides,
			};
		};

		it("accepts claims carrying a past auth_time", async () => {
			const { service } = makeService();
			const raw = makeRawClaims();

			const result = await service.validate({
				...raw,
				auth_time: (raw.iat as number) - 86_400,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.authTime).toBe((raw.iat as number) - 86_400);
			}
		});

		it("accepts legacy claims with no auth_time and falls back to iat", async () => {
			const { service } = makeService();
			const raw = makeRawClaims();

			const result = await service.validate(raw);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.authTime).toBe(raw.iat);
			}
		});

		it("rejects an auth_time later than iat", async () => {
			const { service } = makeService();
			const raw = makeRawClaims();

			// Still in the past, so this can only trip the after-iat check.
			const result = await service.validate({
				...raw,
				auth_time: (raw.iat as number) + 5,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toBe("session.claims.invalid_semantics");
				expect(result.error.cause).toBe("auth_time_after_iat");
			}
		});

		it("rejects an auth_time in the future", async () => {
			const { service } = makeService();
			const raw = makeRawClaims();

			const result = await service.validate({
				...raw,
				auth_time: nowInSeconds() + 3600,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toBe("session.claims.invalid_semantics");
				expect(result.error.cause).toBe("auth_time_in_future");
			}
		});
	});
});
