import { AUTH_LOG_CONTEXTS } from "@/modules/auth/application/constants/auth-logging.constants";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Persists a session token and logs the operation success.
 *
 * @param deps - Dependencies including the logger and the session store adapter.
 * @param params - Configuration parameters for the session cookie and log entry.
 * @returns A promise that resolves when the token is stored and the operation is logged.
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
): Promise<Result<void, AppError>> {
  const setResult = await deps.sessionCookieAdapter.set(
    params.token,
    params.expiresAtMs,
  );

  if (!setResult.ok) {
    deps.logger.errorWithDetails(
      "Session persistence failed",
      setResult.error,
      {
        operationContext: AUTH_LOG_CONTEXTS.SESSION,
        operationIdentifiers: {
          ...params.identifiers,
          expiresAt: params.expiresAtMs,
        },
        operationName: `${params.operationName}.error`,
      },
    );

    return Err(setResult.error);
  }

  deps.logger.operation("info", params.message, {
    operationContext: AUTH_LOG_CONTEXTS.SESSION,
    operationIdentifiers: {
      ...params.identifiers,
      expiresAt: params.expiresAtMs,
    },
    operationName: params.operationName,
  });

  return Ok(undefined);
}

/**
 * Deletes a session token and logs the operation outcome.
 *
 * @param deps - Dependencies including the logger and the session store adapter.
 * @param params - Configuration parameters for the log entry.
 * @returns A promise that resolves when the token is deleted and the operation is logged.
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
): Promise<Result<void, AppError>> {
  const deleteResult = await deps.sessionCookieAdapter.delete();

  if (!deleteResult.ok) {
    deps.logger.errorWithDetails(
      "Session deletion failed",
      deleteResult.error,
      {
        operationContext: AUTH_LOG_CONTEXTS.SESSION,
        operationIdentifiers: params.identifiers,
        operationName: `${params.operationName}.error`,
      },
    );

    return Err(deleteResult.error);
  }

  deps.logger.operation("info", params.message, {
    operationContext: AUTH_LOG_CONTEXTS.SESSION,
    operationIdentifiers: params.identifiers,
    operationName: params.operationName,
  });

  return Ok(undefined);
}
