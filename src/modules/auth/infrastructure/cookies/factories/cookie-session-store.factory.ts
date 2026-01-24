import "server-only";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import { CookieSessionStoreAdapter } from "@/modules/auth/infrastructure/cookies/adapters/cookie-session-store.adapter";
import { createCookieService } from "@/server/cookies/cookie.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory function for creating adapter instances.
 *
 * @param logger - The logging client to use for observability.
 */
export function cookieSessionStoreFactory(
  logger: LoggingClientContract,
): SessionStoreContract {
  const cookies = createCookieService();
  return new CookieSessionStoreAdapter(cookies, logger);
}
