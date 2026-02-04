/** biome-ignore-all lint/style/noMagicNumbers: find a better solution */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { UPDATE_SESSION_OUTCOME_REASON } from "@/modules/auth/application/session/dtos/responses/update-session-outcome.dto";
import { toUnixSeconds } from "@/modules/auth/domain/session/value-objects/time.value";
import { makeAuthComposition } from "@/modules/auth/infrastructure/composition/auth.composition";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { Ok } from "@/shared/results/result";

// Mock env-server before other imports that might use it
vi.mock("@/server/config/env-server", () => ({
  AUTH_BCRYPT_SALT_ROUNDS: 10,
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  SESSION_AUDIENCE: "test-audience",
  SESSION_ISSUER: "test-issuer",
  SESSION_SECRET: "test-secret-at-least-32-chars-long-!!!",
}));

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: how can i address this?
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

  const createTokenWithDates = async (iat: number, exp: number) => {
    const auth = await makeAuthComposition();
    // biome-ignore lint/suspicious/noExplicitAny: is this okay?
    const tokenService = (auth.services.sessionService as any).deps
      .sessionTokenService;
    const codec = tokenService.codec;

    const claims = {
      exp,
      iat,
      jti: "token-123",
      nbf: iat,
      role: "USER",
      sid: "session-123",
      sub: "user-123",
    };

    const result = await codec.encode(claims);
    if (!result.ok) {
      throw result.error;
    }
    return result.value;
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
