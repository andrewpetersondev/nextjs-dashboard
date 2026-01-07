import "server-only";

import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Common dependencies required by Session-related application use cases.
 */
export type SessionUseCaseDependencies = Readonly<{
  logger: LoggingClientContract;
  sessionCookieAdapter: SessionStoreContract;
  sessionTokenAdapter: SessionTokenServiceContract;
}>;
