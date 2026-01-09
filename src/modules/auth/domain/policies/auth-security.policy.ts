import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Domain Policy: Session Verification Failures.
 *
 * Standardizes how the system responds to missing or malformed sessions.
 */
export function makeMissingSessionErrorPolicy(): AppError {
  return makeAppError(APP_ERROR_KEYS.unauthorized, {
    cause:
      "TODO: I DONT WANT TO MAKE CAUSE OPTIONAL AT THIS TIME, BUT I MIGHT IN THE FUTURE. SHOULD I RETHINK MY" +
      " ERROR STRATEGY TO HAVE APPERROR, DOMAINERROR, INFRASTRUCTUREERROR?",
    message: "No active session found.",
    metadata: {
      policy: "session-verification",
      reason: "no_token",
    },
  });
}

export function makeInvalidSessionClaimsErrorPolicy(cause?: unknown): AppError {
  return makeAppError(APP_ERROR_KEYS.validation, {
    cause: cause instanceof Error ? cause : String(cause ?? "unknown_reason"),
    message: "Session contains invalid or missing identity claims.",
    metadata: {
      policy: "session-verification",
      reason: "invalid_claims",
    },
  });
}
