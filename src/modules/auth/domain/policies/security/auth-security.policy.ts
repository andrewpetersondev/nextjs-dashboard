import {
  AUTH_POLICY_NAMES,
  AUTH_POLICY_REASONS,
} from "@/modules/auth/domain/constants/auth-policy.constants";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Domain Policy: Session Security Failures.
 * Provides factory functions for common authentication and authorization errors.
 */
export const AuthSecurityErrors = {
  /** No session found in the request */
  missingSession: (): AppError =>
    makeAppError(APP_ERROR_KEYS.unauthorized, {
      cause: "No active session found.",
      message: "No active session found.",
      metadata: {
        policy: AUTH_POLICY_NAMES.SESSION_VERIFICATION,
        reason: AUTH_POLICY_REASONS.NO_TOKEN,
      },
    }),
};
