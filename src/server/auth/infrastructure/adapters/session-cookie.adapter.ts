import "server-only";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/server/auth/domain/session/constants";
import { logger } from "@/shared/infrastructure/logging/infrastructure/logging.client";

/**
 * Adapter for managing session cookies using Next.js cookie store.
 * Provides a clean interface for session cookie operations.
 */
export class SessionCookieAdapter {
  /**
   * Deletes the session cookie, effectively logging out the user.
   */
  async delete(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    logger.info("Session cookie deleted", {
      logging: { context: "SessionCookieAdapter.delete" },
    });
  }

  /**
   * Retrieves the current session cookie value.
   * @returns The session cookie value, or undefined if not set
   */
  async get(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value;
  }

  /**
   * Sets the session cookie with the provided value and options.
   * @param value - The session token to store
   * @param options - Cookie configuration options (httpOnly, secure, etc.)
   */
  async set(value: string, options: Partial<ResponseCookie>): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, value, options);
    logger.debug("Session cookie set", {
      logging: { context: "SessionCookieAdapter.set" },
    });
  }
}

// Factory function for creating adapter instances without singletons
export function createSessionCookieAdapter(): SessionCookieAdapter {
  return new SessionCookieAdapter();
}
