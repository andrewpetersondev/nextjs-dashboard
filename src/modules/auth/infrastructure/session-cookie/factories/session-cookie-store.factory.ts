import "server-only";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import { SessionCookieStoreAdapter } from "@/modules/auth/infrastructure/session-cookie/adapters/session-cookie-store.adapter";
import { createCookieService } from "@/server/cookies/cookie.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Factory function for creating adapter instances.
 *
 * @param logger - The logging client to use for observability.
 */
export function sessionCookieStoreFactory(
  logger: LoggingClientContract,
): SessionStoreContract {
  const cookies = createCookieService();
  return new SessionCookieStoreAdapter(cookies, logger);
}
