import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Domain Policy: Session Security Failures.
 * Provides factory functions for common authentication and authorization errors.
 */
export const AuthSecurityErrors = {
  /** Session claims are invalid or missing */
  invalidClaims: (cause?: unknown): AppError =>
    makeAppError(APP_ERROR_KEYS.validation, {
      cause: cause instanceof Error ? cause : String(cause ?? "unknown_reason"),
      message: "Session contains invalid or missing identity claims.",
      metadata: { policy: "session-verification", reason: "invalid_claims" },
    }),

  /** No session found in the request */
  missingSession: (): AppError =>
    makeAppError(APP_ERROR_KEYS.unauthorized, {
      cause: "No active session found.",
      message: "No active session found.",
      metadata: { policy: "session-verification", reason: "no_token" },
    }),

  /** A session is required for the requested action, but it's missing or expired */
  sessionRequired: (reason: "expired" | "invalid" | "missing"): AppError =>
    makeAppError(APP_ERROR_KEYS.unauthorized, {
      cause: reason,
      message: "Authentication required",
      metadata: { policy: "session-lifecycle", reason },
    }),
};
