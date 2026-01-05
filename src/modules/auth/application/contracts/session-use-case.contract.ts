import "server-only";

import type { SessionStoreContract } from "@/modules/auth/domain/services/session-store.contract";
import type { SessionTokenAdapter } from "@/modules/auth/infrastructure/adapters/session-token.adapter";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Common dependencies required by Session-related application use cases.
 */
export type SessionUseCaseDeps = Readonly<{
  logger: LoggingClientContract;
  sessionCookieAdapter: SessionStoreContract;
  sessionTokenAdapter: SessionTokenAdapter;
}>;
