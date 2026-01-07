import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Domain Policy: Anti-Enumeration Security.
 *
 * To prevent attackers from discovering which emails are registered,
 * all credential-related failures must return a unified error.
 */
export function applyAntiEnumerationPolicy(originalError: AppError): AppError {
  const isCredentialFailure =
    originalError.key === "not_found" ||
    originalError.key === "invalid_credentials";

  if (!isCredentialFailure) {
    return originalError;
  }

  return makeAppError(APP_ERROR_KEYS.invalid_credentials, {
    cause: originalError, // Preserve the real reason for internal logging
    message: "Authentication failed due to invalid email or password.",
    metadata: {
      code: "invalidCredentials",
      policy: "anti-enumeration",
    },
  });
}

/**
 * Domain Policy: Session Verification Failures.
 *
 * Standardizes how the system responds to missing or malformed sessions.
 */
export function makeMissingSessionError(): AppError {
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

export function makeInvalidSessionClaimsError(cause?: unknown): AppError {
  return makeAppError(APP_ERROR_KEYS.validation, {
    cause: cause instanceof Error ? cause : String(cause ?? "unknown_reason"),
    message: "Session contains invalid or missing identity claims.",
    metadata: {
      policy: "session-verification",
      reason: "invalid_claims",
    },
  });
}
