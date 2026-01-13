import "server-only";

import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Persists a session token and logs the success.
 */
export async function setSessionCookieAndLogHelper(
  deps: Readonly<{
    logger: LoggingClientContract;
    sessionCookieAdapter: SessionStoreContract;
  }>,
  params: Readonly<{
    expiresAtMs: number;
    identifiers: Record<string, unknown>;
    message: string;
    operationName: string;
    token: string;
  }>,
): Promise<void> {
  await deps.sessionCookieAdapter.set(params.token, params.expiresAtMs);

  deps.logger.operation("info", params.message, {
    operationContext: "session",
    operationIdentifiers: {
      ...params.identifiers,
      expiresAt: params.expiresAtMs,
    },
    operationName: params.operationName,
  });
}

/**
 * Deletes a session token and logs the outcome.
 */
export async function deleteSessionCookieAndLogHelper(
  deps: Readonly<{
    logger: LoggingClientContract;
    sessionCookieAdapter: SessionStoreContract;
  }>,
  params: Readonly<{
    identifiers: Record<string, unknown>;
    message: string;
    operationName: string;
  }>,
): Promise<void> {
  await deps.sessionCookieAdapter.delete();

  deps.logger.operation("info", params.message, {
    operationContext: "session",
    operationIdentifiers: params.identifiers,
    operationName: params.operationName,
  });
}
