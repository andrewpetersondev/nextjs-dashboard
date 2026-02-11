import "server-only";
import type { SessionStoreContract } from "@/modules/auth/application/session/contracts/session-store.contract";
import type { SessionTokenServiceContract } from "@/modules/auth/application/session/contracts/session-token-service.contract";
import type { ReadSessionTokenOutcomeDto } from "@/modules/auth/application/session/dtos/responses/read-session-token-outcome.dto";
import { cleanupInvalidTokenHelper } from "@/modules/auth/application/shared/helpers/session-cleanup.helper";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

async function tryCleanupInvalidToken(
  params: Readonly<{
    logger: LoggingClientContract;
    reason: "invalid_claims" | "invalid_claims_semantics" | "invalid_token";
    sessionStore: SessionStoreContract;
    shouldCleanup: boolean;
  }>,
): Promise<boolean> {
  if (!params.shouldCleanup) {
    return false;
  }

  const cleanup = await cleanupInvalidTokenHelper(
    {
      logger: params.logger,
      sessionStore: params.sessionStore,
    },
    { reason: params.reason, source: "readSessionTokenHelper" },
  );

  return cleanup.didCleanup;
}

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
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: fix later
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
    const didCleanup = await tryCleanupInvalidToken({
      logger: deps.logger,
      reason: "invalid_token",
      sessionStore: deps.sessionStore,
      shouldCleanup: options.cleanupOnInvalidToken,
    });

    if (decodedResult.error.key === "unexpected") {
      return Err(decodedResult.error);
    }

    return Ok({ didCleanup, kind: "invalid_token" });
  }

  const validatedResult = await deps.sessionTokenService.validate(
    decodedResult.value,
  );

  if (!validatedResult.ok) {
    const metadataReason =
      validatedResult.error.key === "validation"
        ? (validatedResult.error.metadata as Readonly<{ reason?: string }>)
            .reason
        : undefined;

    const kind:
      | "invalid_claims"
      | "invalid_claims_semantics"
      | "invalid_token" =
      metadataReason === "invalid_schema"
        ? "invalid_claims"
        : // biome-ignore lint/style/noNestedTernary: TODO: POSSIBLY NEED TO REFACTOR
          metadataReason
          ? "invalid_claims_semantics"
          : "invalid_token";

    const didCleanup = await tryCleanupInvalidToken({
      logger: deps.logger,
      reason: kind,
      sessionStore: deps.sessionStore,
      shouldCleanup: options.cleanupOnInvalidToken,
    });

    if (validatedResult.error.key === "unexpected") {
      return Err(validatedResult.error);
    }

    return Ok({ didCleanup, kind });
  }

  return Ok({
    decoded: validatedResult.value,
    kind: "decoded",
  });
}
