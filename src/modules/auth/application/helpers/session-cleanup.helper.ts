import "server-only";
import { AUTH_LOG_CONTEXTS } from "@/modules/auth/application/constants/auth-logging.constants";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";

/**
 * Best-effort cleanup for invalid session tokens.
 *
 * @remarks
 * - Never throws (cleanup must not break request flows).
 * - Logs failures for observability (no silent drift).
 */
export async function cleanupInvalidTokenHelper(
  deps: Readonly<{
    logger: LoggingClientContract;
    sessionStore: SessionStoreContract;
  }>,
  context: Readonly<{
    reason:
      | "invalid_token"
      | "invalid_claims"
      | "invalid_claims_semantics"
      | "invalid_session_state"
      | "unknown";
    source: "readSessionTokenHelper" | "readSessionUseCase";
  }>,
): Promise<
  Readonly<{
    didCleanup: boolean;
    cleanupFailed: boolean;
  }>
> {
  try {
    const deleteResult = await deps.sessionStore.delete();

    if (!deleteResult.ok) {
      deps.logger.operation("warn", "Session cleanup failed", {
        operationContext: AUTH_LOG_CONTEXTS.SESSION,
        operationIdentifiers: {
          reason: context.reason,
          source: context.source,
        },
        operationName: "session.cleanup.failed",
      });

      deps.logger.errorWithDetails(
        "Session cleanup failed with an application error.",
        deleteResult.error,
        {
          operationContext: AUTH_LOG_CONTEXTS.SESSION,
          operationIdentifiers: {
            reason: context.reason,
            source: context.source,
          },
          operationName: "session.cleanup.failed.details",
        },
      );

      return { cleanupFailed: true, didCleanup: false };
    }

    // Success is intentionally not logged to avoid production noise.
    return { cleanupFailed: false, didCleanup: true };
  } catch (error: unknown) {
    deps.logger.operation("warn", "Session cleanup threw unexpectedly", {
      operationContext: AUTH_LOG_CONTEXTS.SESSION,
      operationIdentifiers: {
        reason: context.reason,
        source: context.source,
      },
      operationName: "session.cleanup.threw",
    });

    deps.logger.errorWithDetails("Session cleanup threw unexpectedly.", error, {
      operationContext: AUTH_LOG_CONTEXTS.SESSION,
      operationIdentifiers: {
        reason: context.reason,
        source: context.source,
      },
      operationName: "session.cleanup.threw.details",
    });

    return { cleanupFailed: true, didCleanup: false };
  }
}
