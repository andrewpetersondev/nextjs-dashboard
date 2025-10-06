"use server";
import { redirect } from "next/navigation";
import type { SignupField } from "@/features/auth/lib/auth.schema";
import { signupCommandSchema } from "@/features/auth/lib/auth-commands.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { UserAuthFlowService } from "@/server/auth/user-auth.service";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { toUserId } from "@/shared/domain/id-converters";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-errors.type";
import type {
  FormResult,
  FormValidationError,
} from "@/shared/forms/types/form-state.type";

// --- Constants ---
const SIGNUP_FIELDS = ["email", "username", "password"] as const;
const LOGGER_CONTEXT = "actions.signup";
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
const FIX_HIGHLIGHTED_FIELDS_MESSAGE = "Please fix the highlighted fields";
const FIELD_ERROR_CONFLICT = "This value is already taken";
const FIELD_ERROR_MISSING = "This field is required";
const DEFAULT_FIELD_ERRORS: DenseFieldErrorMap<SignupField> = {
  email: [],
  password: [],
  username: [],
};
const DASHBOARD_URL = "/dashboard";

// --- Types ---
type SignupFormResult = FormResult<SignupField, unknown>;

// --- Helpers ---
function toDenseFieldErrorMap(
  sparse: Partial<Record<SignupField, string[]>>,
): DenseFieldErrorMap<SignupField> {
  const result = {
    email: [] as readonly string[],
    password: [] as readonly string[],
    username: [] as readonly string[],
  } satisfies Record<SignupField, readonly string[]>;

  for (const key of SIGNUP_FIELDS) {
    const value = sparse[key] ?? [];
    result[key] = value;
  }

  return result;
}

// Maps AuthServiceError to dense field errors
// Helper type guards
function isConflictError(
  error: unknown,
): error is { kind: "conflict"; targets: Array<"email" | "username"> } {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { kind?: unknown }).kind === "conflict" &&
    Array.isArray((error as { targets?: unknown }).targets) &&
    (error as { targets: unknown[] }).targets.every(
      (t) => t === "email" || t === "username",
    )
  );
}

function isMissingFieldsError(
  error: unknown,
): error is { kind: "missing_fields"; fields: SignupField[] } {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { kind?: unknown }).kind === "missing_fields" &&
    Array.isArray((error as { fields?: unknown }).fields) &&
    (error as { fields: unknown[] }).fields.every(
      (f): f is SignupField =>
        f === "email" || f === "password" || f === "username",
    )
  );
}

// Main mapper
function serviceErrorToDenseFieldErrors(
  error: unknown,
): DenseFieldErrorMap<SignupField> {
  if (isConflictError(error)) {
    const result = { ...DEFAULT_FIELD_ERRORS };
    for (const field of error.targets) {
      result[field] = [FIELD_ERROR_CONFLICT];
    }
    return result;
  }

  if (isMissingFieldsError(error)) {
    const result = { ...DEFAULT_FIELD_ERRORS };
    for (const field of error.fields) {
      result[field] = [FIELD_ERROR_MISSING];
    }
    return result;
  }

  return { ...DEFAULT_FIELD_ERRORS };
}

function toValidationError(
  errors: DenseFieldErrorMap<SignupField>,
  message: string,
  values?: Record<string, unknown>,
): FormValidationError<SignupField> {
  return {
    fieldErrors: errors,
    kind: "validation",
    message,
    values,
  };
}

function toGenericExceptionError(): SignupFormResult {
  return {
    error: {
      fieldErrors: { ...DEFAULT_FIELD_ERRORS },
      kind: "validation",
      message: GENERIC_ERROR_MESSAGE,
    },
    ok: false,
  };
}

/**
 * Server Action for signup.
 * Redirects on success; returns dense error map on failure.
 */
export async function signupAction(
  _prevState: SignupFormResult,
  formData: FormData,
): Promise<SignupFormResult> {
  // 1) Validate input
  const validation = await validateFormGeneric(
    formData,
    signupCommandSchema,
    SIGNUP_FIELDS,
    { loggerContext: LOGGER_CONTEXT },
  );

  // FAILED BRANCH: early return if validation failed
  if (!validation.ok) {
    // validation.error is { message, fieldErrors } from validateFormGeneric
    return {
      error: toValidationError(
        toDenseFieldErrorMap(
          (validation.error.fieldErrors ?? DEFAULT_FIELD_ERRORS) as Partial<
            Record<SignupField, string[]>
          >,
        ),
        validation.error.message ?? FIX_HIGHLIGHTED_FIELDS_MESSAGE,
        // values reconstructed on the client from previous submission; raw values are not exposed here
        undefined,
      ),
      ok: false,
    };
  }

  // 2) Call service
  try {
    const service = new UserAuthFlowService(getAppDb());
    const result = await service.signup(validation.value.data);

    if (result.ok) {
      await setSessionToken(
        toUserId(result.value.id),
        toUserRole(result.value.role),
      );
      redirect(DASHBOARD_URL);
    }

    return {
      error: toValidationError(
        serviceErrorToDenseFieldErrors(result.error),
        (result.error as { message?: string }).message ??
          FIX_HIGHLIGHTED_FIELDS_MESSAGE,
        undefined,
      ),
      ok: false,
    };
  } catch (err: unknown) {
    serverLogger.error(
      { context: LOGGER_CONTEXT, err, kind: "exception" },
      "Unhandled exception",
    );
    return toGenericExceptionError();
  }
}
