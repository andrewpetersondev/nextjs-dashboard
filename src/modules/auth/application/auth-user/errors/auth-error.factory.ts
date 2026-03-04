import { AUTH_OPERATIONS } from "@/modules/auth/application/shared/logging/auth-logging.constants";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Authentication failure reasons used internally for logging/debugging.
 */
type CredentialFailureReason =
	| "invalid_password"
	| "user_disabled"
	| "user_not_found";

/**
 * Explicit context for credential failures to prevent metadata drift.
 */
type CredentialFailureContext = { email: string } | { userId: string };

/**
 * Application-level Auth Error Factory.
 *
 * Handles cross-cutting concerns like Anti-Enumeration that transform
 * specific domain/infra failures into safe application results.
 */
export const AuthErrorFactory = {
	/**
	 * Implements Anti-Enumeration: Maps specific reasons to a generic identity.
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
				policy: AUTH_OPERATIONS.ANTI_ENUMERATION,
				reason,
			},
		});
	},
};
