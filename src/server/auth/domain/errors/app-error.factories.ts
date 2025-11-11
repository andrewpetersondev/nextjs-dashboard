import "server-only";
import { SIGNUP_FIELDS_LIST } from "@/features/auth/lib/auth.schema";
import { ERROR_CODES } from "@/shared/core/errors/base/error-codes";
import {
  type AppError,
  makeAppErrorDetails,
} from "@/shared/core/result/app-error/app-error";
import { appErrorFromCode } from "@/shared/core/result/app-error/app-error-builders";

type AuthErrorKind =
  | "missing_fields"
  | "conflict"
  | "invalid_credentials"
  | "validation"
  | "unexpected";

/**
 * Extracts error message from unknown error, with fallback.
 */
function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) {
    return e.message;
  }
  if (typeof e === "object" && e !== null && "message" in e) {
    const msg = (e as { message: unknown }).message;
    return typeof msg === "string" ? msg : fallback;
  }
  return fallback;
}

/**
 * Standard authentication error messages.
 */
const AUTH_MESSAGES = {
  conflict: "Email or username already in use",
  invalidCreds: "Invalid email or password",
  missing: "Missing required fields",
  unexpected: "Unexpected error occurred",
  unknown: "Unknown error occurred",
  validation: "Invalid data",
} as const;

/**
 * Creates standardized AppError instances for common authentication scenarios.
 *
 * @param kind - The type of authentication error
 * @param init - Optional additional context data
 * @returns Properly formatted AppError with appropriate code and details
 */
export function createAuthAppError(
  kind: AuthErrorKind,
  init?: Readonly<Record<string, unknown>>,
): AppError {
  switch (kind) {
    case "missing_fields":
      return appErrorFromCode(
        "validation",
        AUTH_MESSAGES.missing,
        makeAppErrorDetails({
          extra: init,
          fieldErrors: Object.fromEntries(
            SIGNUP_FIELDS_LIST.map((f) => [
              f,
              [AUTH_MESSAGES.missing] as const,
            ]),
          ),
          formErrors: [],
        }),
      );

    case "conflict":
      return appErrorFromCode(
        "conflict",
        AUTH_MESSAGES.conflict,
        makeAppErrorDetails({
          extra: init,
          fieldErrors: Object.fromEntries(
            ERROR_CODES.unauthorized.authFields.map((f) => [
              f,
              [AUTH_MESSAGES.conflict] as const,
            ]),
          ),
          formErrors: [],
        }),
      );

    case "invalid_credentials":
      return appErrorFromCode("unauthorized", AUTH_MESSAGES.invalidCreds, {
        reason: "invalid_credentials",
        ...init,
      });

    case "validation":
      return appErrorFromCode("validation", AUTH_MESSAGES.validation, init);

    default:
      return appErrorFromCode("unknown", AUTH_MESSAGES.unexpected, init);
  }
}

/**
 * Converts unknown error to standardized AppError.
 * Use as last resort for unexpected errors.
 */
export function toUnexpectedAppError(e: unknown): AppError {
  const message = getErrorMessage(e, AUTH_MESSAGES.unexpected);
  return appErrorFromCode("unknown", message, { originalError: e });
}
