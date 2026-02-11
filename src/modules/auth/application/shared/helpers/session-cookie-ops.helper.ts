import type { SessionStoreContract } from "@/modules/auth/application/session/contracts/session-store.contract";
import { AUTH_LOG_CONTEXTS } from "@/modules/auth/application/shared/logging/auth-logging.constants";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

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
    deps.logger.operation("warn", "Session cookie persistence failed", {
      operationContext: AUTH_LOG_CONTEXTS.SESSION,
      operationIdentifiers: {
        ...params.identifiers,
        expiresAtMs: params.expiresAtMs,
      },
      operationName: `${params.operationName}.failed`,
    });

    deps.logger.errorWithDetails(
      "Session cookie persistence failed with an application error.",
      setResult.error,
      {
        operationContext: AUTH_LOG_CONTEXTS.SESSION,
        operationIdentifiers: {
          ...params.identifiers,
          expiresAtMs: params.expiresAtMs,
        },
        operationName: `${params.operationName}.failed.details`,
      },
    );

    return Err(setResult.error);
  }

  deps.logger.operation("info", params.message, {
    operationContext: AUTH_LOG_CONTEXTS.SESSION,
    operationIdentifiers: {
      ...params.identifiers,
      expiresAtMs: params.expiresAtMs,
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
    deps.logger.operation("warn", "Session cookie deletion failed", {
      operationContext: AUTH_LOG_CONTEXTS.SESSION,
      operationIdentifiers: params.identifiers,
      operationName: `${params.operationName}.failed`,
    });

    deps.logger.errorWithDetails(
      "Session cookie deletion failed with an application error.",
      deleteResult.error,
      {
        operationContext: AUTH_LOG_CONTEXTS.SESSION,
        operationIdentifiers: params.identifiers,
        operationName: `${params.operationName}.failed.details`,
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
