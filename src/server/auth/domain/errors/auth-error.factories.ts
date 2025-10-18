import "server-only";
import {
  AUTH_CONFLICT_TARGETS,
  AUTH_MESSAGES,
  type AuthError,
  DEFAULT_MISSING_FIELDS,
} from "@/server/auth/domain/errors/auth-error.model";

export function getErrorMessage(e: unknown, fallback: string): string {
  return typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as { message?: unknown }).message === "string"
    ? (e as { message: string }).message
    : fallback;
}

export function createAuthServiceError<K extends AuthError["kind"]>(
  kind: K,
  init?: Partial<Extract<AuthError, { kind: K }>>,
): AuthError {
  switch (kind) {
    case "missing_fields":
      return {
        fields: DEFAULT_MISSING_FIELDS,
        kind,
        message: AUTH_MESSAGES.missing,
        ...init,
      } as const;
    case "conflict":
      return {
        kind,
        message: AUTH_MESSAGES.conflict,
        targets: AUTH_CONFLICT_TARGETS,
        ...init,
      } as const;
    case "invalid_credentials":
      return { kind, message: AUTH_MESSAGES.invalidCreds, ...init } as const;
    case "validation":
      return { kind, message: AUTH_MESSAGES.validation, ...init } as const;
    case "unexpected":
      return {
        kind: "unexpected",
        message: AUTH_MESSAGES.unexpected,
        ...init,
      } as const;
    default:
      return { kind: "unexpected", message: AUTH_MESSAGES.unexpected } as const;
  }
}

/**
 * Normalize any unknown error to an AuthActionError of kind "unexpected",
 * preserving message when available.
 */
export function toUnexpectedAuthError(e: unknown): AuthError {
  const message = getErrorMessage(e, AUTH_MESSAGES.unexpected);
  return createAuthServiceError("unexpected", { message });
}
