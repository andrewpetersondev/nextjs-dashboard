import "server-only";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/server/auth/domain/constants/session.constants";
import { serverLogger } from "@/server/logging/serverLogger";

export class SessionCookieAdapter {
  async get(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value;
  }

  async set(value: string, options: Partial<ResponseCookie>): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, value, options);
    serverLogger.debug(
      { context: "SessionCookieAdapter.set" },
      "Session cookie set",
    );
  }

  async delete(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    serverLogger.info(
      { context: "SessionCookieAdapter.delete" },
      "Session cookie deleted",
    );
  }
}

// Export singleton instance
export const sessionCookieAdapter = new SessionCookieAdapter();
