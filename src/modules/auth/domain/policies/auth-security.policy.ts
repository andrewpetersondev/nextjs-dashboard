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
