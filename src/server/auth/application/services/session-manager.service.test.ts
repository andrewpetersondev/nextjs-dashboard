import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  SessionPort,
  SessionTokenCodecPort,
} from "@/server/auth/application/ports/session.port";
import { SessionManager } from "@/server/auth/application/services/session-manager.service";
import {
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
} from "@/server/auth/domain/session/constants";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { logger as realLogger } from "@/shared/logging/infra/logging.client";

class InMemoryCookie implements SessionPort {
  private value?: string;
  // biome-ignore lint/suspicious/useAwait: <explanation>
  async delete(): Promise<void> {
    this.value = undefined;
  }
  // biome-ignore lint/suspicious/useAwait: <explanation>
  async get(): Promise<string | undefined> {
    return this.value;
  }
  // biome-ignore lint/suspicious/useAwait: <explanation>
  async set(value: string): Promise<void> {
    this.value = value;
  }
}

// Extremely simple JWT stub that just base64-encodes/decodes JSON without signing.
class JsonStubJwt implements SessionTokenCodecPort {
  decode(token: string) {
    try {
      const json = Buffer.from(token, "base64").toString("utf8");
      return JSON.parse(json);
    } catch {
      return;
    }
  }
  encode(claims: any, _expiresAtMs: number): Promise<string> {
    return Buffer.from(JSON.stringify(claims), "utf8").toString("base64");
  }
}

// Quiet logger for tests
const testLogger: LoggingClientContract = realLogger.child({ scope: "test" });

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
describe("SessionManager", () => {
  let cookie: InMemoryCookie;
  let jwt: JsonStubJwt;
  let manager: SessionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    cookie = new InMemoryCookie();
    jwt = new JsonStubJwt();
    manager = new SessionManager(cookie, jwt, testLogger);
  });

  it("establishes a session and sets a cookie", async () => {
    const res = await manager.establish({
      id: "user-1" as any,
      role: "user" as any,
    });
    expect(res.ok).toBe(true);
    const stored = await cookie.get();
    expect(stored).toBeTruthy();
    const claims = await jwt.decode(stored!);
    expect(claims?.userId).toBe("user-1");
    expect(claims?.role).toBe("user");
    // expiresAt should be now + SESSION_DURATION_MS
    expect(claims?.expiresAt).toBe(
      Number(new Date("2025-01-01T00:00:00.000Z")) + SESSION_DURATION_MS,
    );
  });

  it("reads a session and returns user info", async () => {
    await manager.establish({ id: "abc" as any, role: "admin" as any });
    const read = await manager.read();
    expect(read).toEqual({ role: "admin", userId: "abc" });
  });

  it("clears a session", async () => {
    await manager.establish({ id: "abc" as any, role: "user" as any });
    await manager.clear();
    const after = await cookie.get();
    expect(after).toBeUndefined();
  });

  it("skips rotation when time left > threshold", async () => {
    // Establish session at t0
    const res = await manager.establish({
      id: "u1" as any,
      role: "user" as any,
    });
    expect(res.ok).toBe(true);
    // Advance time by a small amount less than duration - threshold
    vi.advanceTimersByTime(
      Math.max(1, SESSION_DURATION_MS - SESSION_REFRESH_THRESHOLD_MS - 100),
    );
    const rotate = await manager.rotate();
    expect(rotate.refreshed).toBe(false);
    expect(rotate.reason).toBe("not_needed");
  });

  it("rotates when near expiry (<= threshold)", async () => {
    await manager.establish({ id: "u2" as any, role: "user" as any });
    // Move time to just inside the refresh window
    vi.advanceTimersByTime(
      SESSION_DURATION_MS - SESSION_REFRESH_THRESHOLD_MS + 10,
    );
    const r = await manager.rotate();
    expect(r.refreshed).toBe(true);
    expect(r.reason).toBe("rotated");
  });
});
