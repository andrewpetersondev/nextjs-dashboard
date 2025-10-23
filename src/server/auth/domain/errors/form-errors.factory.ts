import "server-only";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { makeAppErrorDetails } from "@/shared/core/result/app-error/app-error";

/**
 * Maps domain error codes to form field errors.
 * Centralized location for all auth-related field error mappings.
 */
const FIELD_ERROR_MAP = {
  email_conflict: {
    field: "email",
    message: "Email already in use",
  },
  invalid_credentials: {
    field: "email",
    message: "Invalid email or password",
  },
  missing_fields: {
    field: "email",
    message: "Required fields are missing",
  },
  username_conflict: {
    field: "username",
    message: "Username already in use",
  },
} as const;

/**
 * Type guard to check if an error code is a form-aware error code.
 */
function isFormErrorCode(code: unknown): code is FormErrorCode {
  return typeof code === "string" && code in FIELD_ERROR_MAP;
}

/**
 * Get the field error config for a recognized error code.
 * Returns the config if found, undefined otherwise.
 *
 * @param code - The error code to look up
 * @returns The field error configuration, or undefined
 */
function getFieldErrorConfig(
  code: FormErrorCode,
): (typeof FIELD_ERROR_MAP)[FormErrorCode] {
  return FIELD_ERROR_MAP[code];
}

/**
 * Type-safe mapping of error codes to form field configurations.
 */
export type FormErrorCode = keyof typeof FIELD_ERROR_MAP;

/**
 * Normalize domain AppErrors into form-aware errors.
 * These errors already have field errors nested in details for UI consumption.
 *
 * @param error - The AppError to normalize
 * @param params - Configuration including fields list
 * @returns Form-aware AppError with fieldErrors in details
 */
export function toFormAwareError<TField extends string>(
  error: AppError,
  params: {
    readonly fields: readonly TField[];
  },
): AppError {
  const { fields } = params;

  // If already form-aware (has fieldErrors), return as-is
  if (error.details?.fieldErrors) {
    return error;
  }

  // Type-safe mapping: only map if code is recognized
  if (!isFormErrorCode(error.code)) {
    // Fallback: treat as form-level error
    return {
      ...error,
      details: makeAppErrorDetails({
        fieldErrors: Object.freeze(
          Object.fromEntries(fields.map((f) => [f, []])),
        ) as Readonly<Record<string, readonly string[]>>,
      }),
    };
  }

  // At this point, TypeScript knows error.code is FormErrorCode
  const fieldErrorConfig = getFieldErrorConfig(error.code);
  const targetField = fieldErrorConfig.field as TField;
  const isValidField = (fields as readonly string[]).includes(targetField);

  if (isValidField) {
    return {
      ...error,
      details: makeAppErrorDetails({
        fieldErrors: {
          [targetField]: Object.freeze([fieldErrorConfig.message]),
        } as Readonly<Record<string, readonly string[]>>,
      }),
    };
  }

  // Fallback: field not in allowed set
  return {
    ...error,
    details: makeAppErrorDetails({
      fieldErrors: Object.freeze(
        Object.fromEntries(fields.map((f) => [f, []])),
      ) as Readonly<Record<string, readonly string[]>>,
    }),
  };
}
