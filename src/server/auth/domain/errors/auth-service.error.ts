import "server-only";
import type { SignupField } from "@/features/auth/lib/auth.schema";
import { serverLogger } from "@/server/logging/serverLogger";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";
import { Err, type Result } from "@/shared/core/result/result";

// --- Internal Constants ---

const DEFAULT_MISSING_FIELDS: readonly SignupField[] = [
  "email",
  "password",
  "username",
] as const;

const AUTH_CONFLICT_TARGETS = ["email", "username"] as const;

// Centralized messages/targets for cohesion.
const AUTH_MESSAGES = {
  conflict: "Email or username already in use",
  invalidCreds: "Invalid email or password",
  missing: "Missing required fields",
  unexpected: "Unexpected error occurred",
  validation: "Invalid data",
} as const;

// --- External ---

export type AuthActionError =
  | {
      readonly kind: "missing_fields";
      readonly message: string;
      readonly fields: readonly SignupField[];
    }
  | {
      readonly kind: "conflict";
      readonly message: string;
      readonly targets: ReadonlyArray<"email" | "username">;
    }
  | { readonly kind: "invalid_credentials"; readonly message: string }
  | { readonly kind: "validation"; readonly message: string }
  | { readonly kind: "unexpected"; readonly message: string };

// Backward compatibility alias (keep temporarily; remove after migration)
export type AuthServiceError = AuthActionError;

export function createAuthServiceError<K extends AuthActionError["kind"]>(
  kind: K,
  init?: Partial<Extract<AuthActionError, { kind: K }>>,
): AuthActionError {
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
export function toUnexpectedAuthServiceErrorNormalized(
  e: unknown,
): AuthActionError {
  const message =
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as { message?: unknown }).message === "string"
      ? (e as { message: string }).message
      : AUTH_MESSAGES.unexpected;
  return createAuthServiceError("unexpected", { message });
}

// Map repository/domain errors into AuthActionError Results.
export function mapRepoErrorToAuthServiceResult<T>(
  err: unknown,
  context: string,
): Result<T, AuthActionError> {
  if (err instanceof ConflictError) {
    return Err(createAuthServiceError("conflict"));
  }
  if (err instanceof UnauthorizedError) {
    return Err(createAuthServiceError("invalid_credentials"));
  }
  if (err instanceof ValidationError) {
    return Err(createAuthServiceError("validation"));
  }
  serverLogger.error({ context, kind: "unexpected" }, "Unexpected auth error");
  return Err(createAuthServiceError("unexpected"));
}
