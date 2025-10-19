import "server-only";
import {
  AUTH_CONFLICT_TARGETS,
  AUTH_MESSAGES,
  DEFAULT_MISSING_FIELDS,
} from "@/server/auth/domain/errors/app-error.metadata";
import {
  type AppError,
  makeAppErrorDetails,
} from "@/shared/core/result/app-error/app-error";
import { appErrorFromCode } from "@/shared/core/result/app-error/app-error-builders";

export function getErrorMessage(e: unknown, fallback: string): string {
  return typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as { message?: unknown }).message === "string"
    ? (e as { message: string }).message
    : fallback;
}

// Create AppError equivalents for former AuthError kinds
export function createAuthAppError(
  kind:
    | "missing_fields"
    | "conflict"
    | "invalid_credentials"
    | "validation"
    | "unexpected",
  init?: Readonly<Record<string, unknown>>,
): AppError {
  switch (kind) {
    case "missing_fields":
      return appErrorFromCode(
        "VALIDATION",
        AUTH_MESSAGES.missing,
        makeAppErrorDetails({
          extra: init,
          fieldErrors: Object.fromEntries(
            DEFAULT_MISSING_FIELDS.map((f) => [
              f,
              [AUTH_MESSAGES.missing] as const,
            ]),
          ),
          formErrors: [],
        }),
      );
    case "conflict":
      return appErrorFromCode(
        "CONFLICT",
        AUTH_MESSAGES.conflict,
        makeAppErrorDetails({
          extra: init,
          fieldErrors: Object.fromEntries(
            AUTH_CONFLICT_TARGETS.map((f) => [
              f,
              [AUTH_MESSAGES.conflict] as const,
            ]),
          ),
          formErrors: [],
        }),
      );
    case "invalid_credentials":
      return appErrorFromCode("UNAUTHORIZED", AUTH_MESSAGES.invalidCreds, {
        reason: "invalid_credentials",
        ...init,
      });
    case "validation":
      return appErrorFromCode("VALIDATION", AUTH_MESSAGES.validation, init);
    default:
      return appErrorFromCode("UNKNOWN", AUTH_MESSAGES.unexpected, init);
  }
}

/** Normalize unknown to AppError (was AuthError "unexpected"). */
export function toUnexpectedAppError(e: unknown): AppError {
  const message = getErrorMessage(e, AUTH_MESSAGES.unexpected);
  return appErrorFromCode("UNKNOWN", message);
}
