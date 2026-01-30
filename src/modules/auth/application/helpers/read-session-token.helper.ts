import "server-only";
import type { SessionStoreContract } from "@/modules/auth/application/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/contracts/session-token-service.contract";
import type { ReadSessionTokenOutcomeDto } from "@/modules/auth/application/dtos/read-session-token-outcome.dto";
import { cleanupInvalidTokenHelper } from "@/modules/auth/application/helpers/session-cleanup.helper";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Centralizes the retrieval and decoding of a session token from the store.
 *
 * This helper coordinates the interaction between the session store and the
 * session token service.
 *
 * @param deps - Dependencies (session store and token service).
 * @param options - Configuration options (e.g., whether to cleanup on invalid token).
 * @returns A Result containing the read session token outcome or an AppError.
 */
export async function readSessionTokenHelper(
  deps: Readonly<{
    logger: LoggingClientContract;
    sessionStore: SessionStoreContract;
    sessionTokenService: SessionTokenServiceContract;
  }>,
  options: Readonly<{
    cleanupOnInvalidToken: boolean;
  }>,
): Promise<Result<ReadSessionTokenOutcomeDto, AppError>> {
  // 1. Get the token from the store (returns Result<string | undefined, AppError>)
  const tokenResult = await deps.sessionStore.get();

  // 2. Handle failure or missing token early
  if (!tokenResult.ok) {
    return tokenResult; // Propagate the error
  }

  const token = tokenResult.value;

  if (!token) {
    return Ok({ kind: "missing_token" });
  }

  // 3. Now 'token' is a raw string, safe to pass to decode
  const decodedResult = await deps.sessionTokenService.decode(token);

  if (!decodedResult.ok) {
    let didCleanup = false;
    if (options.cleanupOnInvalidToken) {
      const cleanup = await cleanupInvalidTokenHelper(
        {
          logger: deps.logger,
          sessionStore: deps.sessionStore,
        },
        { reason: "invalid_token", source: "readSessionTokenHelper" },
      );
      didCleanup = cleanup.didCleanup;
    }

    if (decodedResult.error.key === "unexpected") {
      return Err(decodedResult.error);
    }

    return Ok({ didCleanup, kind: "invalid_token" });
  }

  return Ok({
    decoded: decodedResult.value,
    kind: "decoded",
  });
}
