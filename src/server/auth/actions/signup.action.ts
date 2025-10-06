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
import { mapSparseToDenseFieldError } from "@/shared/forms/mapping/sparse-to-dense-field-error.mapper";
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
/**
 * Represents the result of submitting a signup form.
 *
 * @typeParam SignupField - The type of the form fields for the signup form.
 * @typeParam unknown - Placeholder for additional response data.
 * @public
 * @example
 * const result: SignupFormResult = handleFormSubmission();
 */
type SignupFormResult = FormResult<SignupField, unknown>;

// --- Helpers ---

/**
 * Determines if the provided error is a conflict error with specific targets.
 *
 * @param error - The error to evaluate, which can be of any type.
 * @returns Whether the error is a conflict error with "email" or "username" targets.
 */
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

/**
 * Checks if the given error represents a "missing fields" error.
 *
 * @param error - The error object to evaluate.
 * @returns True if the error is of type `{ kind: "missing_fields"; fields: SignupField[] }`, otherwise false.
 */
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

/**
 * Transforms a given service error into a dense field error map.
 *
 * @param error - The error object received from the service.
 * @returns A map of field errors for the corresponding signup fields.
 */
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

/**
 * Converts field error details into a standardized `FormValidationError` object.
 *
 * @param errors - A map of field errors associated with signup fields.
 * @param message - A descriptive message for the validation error.
 * @param values - Optional additional context or data associated with the error.
 * @returns A `FormValidationError` containing the provided field errors and details.
 * @public
 */
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

/**
 * Converts a validation error into a generic exception error.
 *
 * @returns A `SignupFormResult` containing pre-defined field errors, an error kind of "validation," and a generic error message.
 * @alpha
 */
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
 * Handles the user signup process by validating input, calling the signup service, and managing session tokens.
 *
 * @param _prevState - The result of the previous signup attempt, used for state tracking on the client.
 * @param formData - The form data submitted by the user for signup.
 * @returns A promise resolving to `SignupFormResult`, indicating success or failure with any associated errors.
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
        mapSparseToDenseFieldError(
          SIGNUP_FIELDS,
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
