/** biome-ignore-all lint/style/noMagicNumbers: find a better solution */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { UPDATE_SESSION_OUTCOME_REASON } from "@/modules/auth/application/session/dtos/responses/update-session-outcome.dto";
import { toUnixSeconds } from "@/modules/auth/domain/session/value-objects/time.value";
import { makeAuthComposition } from "@/modules/auth/infrastructure/composition/auth.composition";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { Ok } from "@/shared/core/result/result";

// Mock env-server before other imports that might use it
vi.mock("@/shared/core/config/server/env-server", () => ({
	AUTH_BCRYPT_SALT_ROUNDS: 10,
	DATABASE_URL: "postgres://user:pass@localhost:5432/db",
	SESSION_SECRET: "test-secret-at-least-32-chars-long-!!!",
}));

describe("Session Rotation Integration", () => {
	// biome-ignore lint/suspicious/noExplicitAny: is this okay?
	let mockCookies: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const { cookies } = await import("next/headers");
		mockCookies = await cookies();
		// Default mock behavior for cookies() which returns an object with get/set/etc
		mockCookies.get.mockReturnValue(undefined);

		const { SessionCookieStoreAdapter } = await import(
			"@/modules/auth/infrastructure/session/adapters/session-cookie-store.adapter"
		);
		vi.spyOn(SessionCookieStoreAdapter.prototype, "get").mockRestore();
	});

	// biome-ignore lint/nursery/useExplicitType: <fix later>
	const getCodec = async () => {
		const auth = await makeAuthComposition();
		// biome-ignore lint/suspicious/noExplicitAny: is this okay?
		const tokenService = (auth.services.sessionService as any).deps
			.sessionTokenService;
		return tokenService.codec;
	};

	/**
	 * @param authTime - Original authentication time. Omit to mint a legacy-shaped
	 *   token with no `auth_time` claim at all (what live tokens looked like before
	 *   the absolute ceiling was anchored).
	 */
	// biome-ignore lint/nursery/useExplicitType: <fix later>
	const createTokenWithDates = async (
		iat: number,
		exp: number,
		authTime?: number,
	) => {
		const codec = await getCodec();

		const claims = {
			...(authTime === undefined ? {} : { authTime }),
			exp,
			iat,
			jti: "00000000-0000-4000-8000-000000000001",
			nbf: iat,
			role: "USER",
			sid: "00000000-0000-4000-8000-000000000002",
			sub: "00000000-0000-4000-8000-000000000003",
		};

		const result = await codec.encode(claims);
		if (!result.ok) {
			throw result.error;
		}
		return result.value;
	};

	/** Decodes a signed token back to raw JWT claims (no semantic validation). */
	// biome-ignore lint/nursery/useExplicitType: <fix later>
	const decodeToken = async (token: string) => {
		const codec = await getCodec();
		const result = await codec.decode(token);
		if (!result.ok) {
			throw result.error;
		}
		return result.value;
	};

	// biome-ignore lint/nursery/useExplicitType: <fix later>
	const stubCookieWith = async (token: string) => {
		const { SessionCookieStoreAdapter } = await import(
			"@/modules/auth/infrastructure/session/adapters/session-cookie-store.adapter"
		);
		return vi
			.spyOn(SessionCookieStoreAdapter.prototype, "get")
			.mockResolvedValue(Ok(token));
	};

	it("should rotate session when approaching expiry", async () => {
		const nowSec = toUnixSeconds(Math.floor(Date.now() / 1000));

		// Create a token that is within the refresh threshold
		const exp = nowSec + 60;
		const iat = nowSec - 300;
		const token = await createTokenWithDates(iat, exp);

		const { SessionCookieStoreAdapter } = await import(
			"@/modules/auth/infrastructure/session/adapters/session-cookie-store.adapter"
		);
		const getSpy = vi
			.spyOn(SessionCookieStoreAdapter.prototype, "get")
			.mockResolvedValue(Ok(token));

		const auth = await makeAuthComposition();
		const result = await auth.services.sessionService.rotate();

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.reason).toBe(UPDATE_SESSION_OUTCOME_REASON.rotated);
			expect(result.value.refreshed).toBe(true);
			expect(mockCookies.set).toHaveBeenCalled();
		}
		getSpy.mockRestore();
	});

	it("should not rotate session when it is still fresh", async () => {
		const nowSec = toUnixSeconds(Math.floor(Date.now() / 1000));

		// Create a token that is NOT yet within the refresh threshold
		const exp = nowSec + 3600;
		const iat = nowSec - 10;
		const token = await createTokenWithDates(iat, exp);

		const { SessionCookieStoreAdapter } = await import(
			"@/modules/auth/infrastructure/session/adapters/session-cookie-store.adapter"
		);
		const getSpy = vi
			.spyOn(SessionCookieStoreAdapter.prototype, "get")
			.mockResolvedValue(Ok(token));

		const auth = await makeAuthComposition();
		const result = await auth.services.sessionService.rotate();

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.reason).toBe(UPDATE_SESSION_OUTCOME_REASON.notNeeded);
			expect(result.value.refreshed).toBe(false);
			expect(mockCookies.set).not.toHaveBeenCalled();
		}
		getSpy.mockRestore();
	});

	it("should terminate session when it has expired", async () => {
		const nowSec = toUnixSeconds(Math.floor(Date.now() / 1000));

		// Create an expired token
		const exp = nowSec - 10;
		const iat = nowSec - 1000;
		const token = await createTokenWithDates(iat, exp);

		const { SessionCookieStoreAdapter } = await import(
			"@/modules/auth/infrastructure/session/adapters/session-cookie-store.adapter"
		);
		const getSpy = vi
			.spyOn(SessionCookieStoreAdapter.prototype, "get")
			.mockResolvedValue(Ok(token));

		const auth = await makeAuthComposition();
		const result = await auth.services.sessionService.rotate();

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe(APP_ERROR_KEYS.unexpected);
			expect(mockCookies.delete).toHaveBeenCalled();
		}
		getSpy.mockRestore();
	});

	describe("absolute lifetime ceiling", () => {
		it("preserves auth_time across rotation while minting a fresh iat", async () => {
			const nowSec = toUnixSeconds(Math.floor(Date.now() / 1000));
			const authTime = nowSec - 86_400; // authenticated a day ago

			// Approaching expiry, so this rotates.
			const token = await createTokenWithDates(
				nowSec - 300,
				nowSec + 60,
				authTime,
			);
			const getSpy = await stubCookieWith(token);

			const auth = await makeAuthComposition();
			const result = await auth.services.sessionService.rotate();

			expect(result.ok).toBe(true);
			expect(mockCookies.set).toHaveBeenCalled();

			const rotatedToken = mockCookies.set.mock.calls[0]?.[1];
			const rotatedClaims = await decodeToken(rotatedToken);

			expect(rotatedClaims.auth_time).toBe(authTime);
			// The token is new even though the session start is not.
			expect(rotatedClaims.iat).toBeGreaterThan(authTime);
			expect(rotatedClaims.sid).toBe("00000000-0000-4000-8000-000000000002");

			getSpy.mockRestore();
		});

		it("terminates a session past the ceiling even though its token is fresh", async () => {
			const nowSec = toUnixSeconds(Math.floor(Date.now() / 1000));
			// 31 days of continuous use: every rotation kept iat fresh, so only
			// auth_time reveals the session's real age.
			const authTime = nowSec - (2_592_000 + 86_400);

			const token = await createTokenWithDates(
				nowSec - 300,
				nowSec + 60,
				authTime,
			);
			const getSpy = await stubCookieWith(token);

			const auth = await makeAuthComposition();
			const result = await auth.services.sessionService.rotate();

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.reason).toBe(
					UPDATE_SESSION_OUTCOME_REASON.absoluteLifetimeExceeded,
				);
				expect(result.value.refreshed).toBe(false);
			}
			// Not merely "refused to extend" — the cookie is cleared.
			expect(mockCookies.delete).toHaveBeenCalled();
			expect(mockCookies.set).not.toHaveBeenCalled();

			getSpy.mockRestore();
		});

		it("rotates a legacy token with no auth_time, pinning it from iat", async () => {
			const nowSec = toUnixSeconds(Math.floor(Date.now() / 1000));
			const iat = nowSec - 300;

			// No auth_time at all — a token minted before the claim existed.
			const token = await createTokenWithDates(iat, nowSec + 60);
			const getSpy = await stubCookieWith(token);

			const auth = await makeAuthComposition();
			const result = await auth.services.sessionService.rotate();

			expect(result.ok).toBe(true);
			expect(mockCookies.set).toHaveBeenCalled();

			const rotatedClaims = await decodeToken(
				mockCookies.set.mock.calls[0]?.[1],
			);

			// The fallback pins the claim at the legacy token's iat, so the ceiling
			// starts binding from here rather than logging the user out on deploy.
			expect(rotatedClaims.auth_time).toBe(iat);

			getSpy.mockRestore();
		});
	});

	it("should return invalid_or_missing_user when no token is present", async () => {
		const auth = await makeAuthComposition();
		mockCookies.get.mockReturnValue(undefined);

		const result = await auth.services.sessionService.rotate();

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.reason).toBe(
				UPDATE_SESSION_OUTCOME_REASON.invalidOrMissingUser,
			);
		}
	});
});
