import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Authentication failure reasons used internally for logging/debugging.
 */
export type CredentialFailureReason =
  | "invalid_password"
  | "user_disabled"
  | "user_not_found";

/**
 * Explicit context for credential failures to prevent metadata drift.
 */
export type CredentialFailureContext = { email: string } | { userId: string };

/**
 * Factory for creating authentication-related errors.
 *
 * This factory implements the Anti-Enumeration Policy by ensuring that
 * specific internal reasons (like whether a user exists or just has a wrong password)
 * are mapped to a consistent public error identity.
 */
export const AuthErrorFactory = {
  /**
   * Creates a unified credential failure error.
   * Internally captures the specific reason for logging, but returns
   * a 'invalid_credentials' code for public safety.
   */
  makeCredentialFailure(
    reason: CredentialFailureReason,
    context: CredentialFailureContext,
  ): AppError {
    return makeAppError(APP_ERROR_KEYS.invalid_credentials, {
      cause: reason,
      message: "Invalid email or password",
      metadata: {
        ...context,
        policy: "anti-enumeration",
        reason,
      },
    });
  },

  /**
   * Creates an error for when a session is required but missing or invalid.
   */
  makeSessionRequired(reason: "expired" | "invalid" | "missing"): AppError {
    return makeAppError(APP_ERROR_KEYS.unauthorized, {
      cause: reason,
      message: "Authentication required",
      metadata: {
        policy: "session-lifecycle",
        reason,
      },
    });
  },
};
