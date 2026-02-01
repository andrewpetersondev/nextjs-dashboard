import "server-only";
import type { SessionStoreContract } from "@/modules/auth/application/session/contracts/session-store.contract";
import { SessionCookieStoreAdapter } from "@/modules/auth/infrastructure/session/adapters/session-cookie-store.adapter";
import { createCookieService } from "@/server/cookies/cookie.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory for creating the session cookie store.
 *
 * @param logger - The logging client.
 * @returns An implementation of the {@link SessionStoreContract}.
 */
export function sessionCookieStoreFactory(
  logger: LoggingClientContract,
): SessionStoreContract {
  const cookies = createCookieService();

  const store: SessionStoreContract = new SessionCookieStoreAdapter(
    cookies,
    logger,
  );

  return store;
}
