import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  SessionPort,
  SessionTokenCodecPort,
} from "@/modules/auth/server/application/ports/session.port";
import { SessionService } from "@/modules/auth/server/application/services/session.service";
import {
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
} from "@/modules/auth/server/types/session.policy.constants";
import type { AuthEncryptPayload } from "@/modules/auth/shared/domain/session/session.codec";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import type { UserId } from "@/shared/branding/brands";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as realLogger } from "@/shared/logging/infrastructure/logging.client";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

const MAX_ABSOLUTE_SESSION_MS = 2_592_000_000 as const;
const ONE_SECOND_MS = 1000 as const;

// Use UUID-ish values so userIdCodec.decode(...) succeeds at runtime.
const USER_ID_ABC = "550e8400-e29b-41d4-a716-4466554400ab" as UserId;
const USER_ID_1 = "550e8400-e29b-41d4-a716-446655440001" as UserId;
const USER_ID_2 = "550e8400-e29b-41d4-a716-446655440002" as UserId;
const USER_ID_3 = "550e8400-e29b-41d4-a716-446655440003" as UserId;
const USER_ID_4 = "550e8400-e29b-41d4-a716-446655440004" as UserId;

class InMemoryCookie implements SessionPort {
  private value?: string;

  delete(): Promise<void> {
    this.value = undefined;
    return Promise.resolve();
  }

  get(): Promise<string | undefined> {
    return Promise.resolve(this.value);
  }

  set(value: string, _expiresAtMs: number): Promise<void> {
    this.value = value;
    return Promise.resolve();
  }
}

class JsonStubJwt implements SessionTokenCodecPort {
  decode(token: string): Promise<Result<AuthEncryptPayload, AppError>> {
    try {
      const json = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(json) as AuthEncryptPayload;
      return Promise.resolve(Ok(payload));
    } catch {
      return Promise.resolve(
        Err(makeAppError("validation", { message: "Invalid token" })),
      );
    }
  }

  encode(
    claims: AuthEncryptPayload,
    _expiresAtMs: number,
  ): Promise<Result<string, AppError>> {
    const token = Buffer.from(JSON.stringify(claims), "utf8").toString(
      "base64",
    );
    return Promise.resolve(Ok(token));
  }
}

const testLogger: LoggingClientContract = realLogger.child({ scope: "test" });

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix>
describe("SessionService", () => {
  let cookie: InMemoryCookie;
  let jwt: JsonStubJwt;
  let manager: SessionService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    cookie = new InMemoryCookie();
    jwt = new JsonStubJwt();
    manager = new SessionService(cookie, jwt, testLogger);
  });

  describe("establish", () => {
    it("establishes a session and sets a cookie", async () => {
      const res = await manager.establish({
        id: "user-1" as UserId,
        role: "user" as UserRole,
      });
      expect(res.ok).toBe(true);
      const stored = await cookie.get();
      expect(stored).toBeDefined();

      if (stored !== undefined) {
        const decoded = await jwt.decode(stored);
        expect(decoded.ok).toBe(true);
        if (decoded.ok) {
          const claims = decoded.value;
          expect(claims.userId).toBe("user-1");
          expect(claims.role).toBe("user");
          expect(claims.expiresAt).toBe(
            Number(new Date("2025-01-01T00:00:00.000Z")) + SESSION_DURATION_MS,
          );
          expect(claims.sessionStart).toBe(
            Number(new Date("2025-01-01T00:00:00.000Z")),
          );
        }
      }
    });

    it("returns error on unexpected failure", async () => {
      const badJwt: SessionTokenCodecPort = {
        decode: vi.fn(),
        encode: vi.fn().mockRejectedValue(new Error("Encoding failed")),
      };

      const failManager = new SessionService(cookie, badJwt, testLogger);

      const res = await failManager.establish({
        id: "user-1" as UserId,
        role: "user" as UserRole,
      });

      expect(res.ok).toBe(false);
    });
  });

  describe("read", () => {
    it("reads a session and returns user info", async () => {
      await manager.establish({
        id: USER_ID_ABC,
        role: "admin" as UserRole,
      });

      const read = await manager.read();
      expect(read).toEqual({ role: "admin", userId: USER_ID_ABC });
    });

    it("returns undefined when no cookie exists", async () => {
      const read = await manager.read();

      expect(read).toBeUndefined();
    });

    it("returns undefined when payload is invalid", async () => {
      await cookie.set("invalid-token", Date.now());

      const read = await manager.read();

      expect(read).toBeUndefined();
    });
  });

  describe("clear", () => {
    it("clears a session", async () => {
      await manager.establish({
        id: USER_ID_ABC,
        role: "user" as UserRole,
      });

      const res = await manager.clear();

      expect(res.ok).toBe(true);

      const after = await cookie.get();
      expect(after).toBeUndefined();
    });

    it("returns error on unexpected failure", async () => {
      const badCookie: SessionPort = {
        delete: vi.fn().mockRejectedValue(new Error("Delete failed")),
        get: vi.fn(),
        set: vi.fn(),
      };

      const failManager = new SessionService(badCookie, jwt, testLogger);

      const res = await failManager.clear();

      expect(res.ok).toBe(false);
    });
  });

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix>
  describe("rotate", () => {
    it("skips rotation when time left > threshold", async () => {
      await manager.establish({
        id: USER_ID_1,
        role: "user" as UserRole,
      });

      vi.advanceTimersByTime(
        SESSION_DURATION_MS - SESSION_REFRESH_THRESHOLD_MS - ONE_SECOND_MS,
      );

      const rotateRes = await manager.rotate();
      expect(rotateRes.ok).toBe(true);

      if (rotateRes.ok) {
        expect(rotateRes.value.refreshed).toBe(false);
        expect(rotateRes.value.reason).toBe("not_needed");
      }
    });

    it("rotates when near expiry (<= threshold)", async () => {
      await manager.establish({
        id: USER_ID_2,
        role: "user" as UserRole,
      });

      vi.advanceTimersByTime(
        SESSION_DURATION_MS - SESSION_REFRESH_THRESHOLD_MS + 10,
      );

      const rotateRes = await manager.rotate();
      expect(rotateRes.ok).toBe(true);

      if (rotateRes.ok) {
        expect(rotateRes.value.refreshed).toBe(true);
        expect(rotateRes.value.reason).toBe("rotated");

        if (rotateRes.value.refreshed) {
          expect(rotateRes.value.userId).toBe(USER_ID_2);
          expect(rotateRes.value.role).toBe("user");
        }
      }
    });

    it("returns no_cookie when no session exists", async () => {
      const rotateRes = await manager.rotate();
      expect(rotateRes.ok).toBe(true);

      if (rotateRes.ok) {
        expect(rotateRes.value.refreshed).toBe(false);
        expect(rotateRes.value.reason).toBe("no_cookie");
      }
    });

    it("prevents rotation when absolute lifetime exceeded", async () => {
      await manager.establish({
        id: USER_ID_3,
        role: "user" as UserRole,
      });

      vi.advanceTimersByTime(MAX_ABSOLUTE_SESSION_MS + ONE_SECOND_MS);

      const rotateRes = await manager.rotate();
      expect(rotateRes.ok).toBe(true);

      if (rotateRes.ok) {
        expect(rotateRes.value.refreshed).toBe(false);
        expect(rotateRes.value.reason).toBe("absolute_lifetime_exceeded");
      }

      const cookieValue = await cookie.get();
      expect(cookieValue).toBeUndefined();
    });

    it("preserves sessionStart across rotations", async () => {
      const startTime = Date.now();
      await manager.establish({
        id: USER_ID_4,
        role: "user" as UserRole,
      });

      vi.advanceTimersByTime(
        SESSION_DURATION_MS - SESSION_REFRESH_THRESHOLD_MS + 10,
      );

      const rotateRes = await manager.rotate();
      expect(rotateRes.ok).toBe(true);

      const stored = await cookie.get();

      if (stored !== undefined) {
        const decoded = await jwt.decode(stored);
        expect(decoded.ok).toBe(true);
        if (decoded.ok) {
          const claims = decoded.value;
          expect(claims.sessionStart).toBe(startTime);
        }
      }
    });
  });
});
