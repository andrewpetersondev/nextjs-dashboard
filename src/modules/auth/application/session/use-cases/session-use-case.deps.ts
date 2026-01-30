import type { SessionStoreContract } from "@/modules/auth/application/session/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/session/contracts/session-token-service.contract";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Common dependencies required by Session-related application use cases.
 */
export type SessionUseCaseDeps = Readonly<{
  logger: LoggingClientContract;
  sessionStore: SessionStoreContract;
  sessionTokenService: SessionTokenServiceContract;
}>;
