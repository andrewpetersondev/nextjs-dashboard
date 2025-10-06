// Purpose: slim, layered signup action using Result and form helpers consistently.
"use server";
import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS_LIST,
  type SignupField,
  SignupSchema,
} from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { UserAuthFlowService } from "@/server/auth/user-auth.service";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { toUserId } from "@/shared/domain/id-converters";
import { setSingleFieldErrorMessage } from "@/shared/forms/errors/dense-error-map.setters";
import {
  toFormOk,
  toFormValidationErr,
} from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-state.type";
import { ROUTES } from "@/shared/routes/routes";

// --- Constants ---
const LOGGER_CONTEXT = "signup.action";
const LOGGER_CONTEXT_SESSION = "signup.action.session";

/**
 * Handles the user signup process by validating input, calling the signup service, and managing session tokens.
 *
 * @param _prevState - The result of the previous signup attempt, used for state tracking on the client.
 * @param formData - The form data submitted by the user for signup.
 * @returns A promise resolving to `SignupFormResult`, indicating success or failure with any associated errors.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function signupAction(
  _prevState: FormResult<SignupField, unknown>,
  formData: FormData,
): Promise<FormResult<SignupField, unknown>> {
  const fields = SIGNUP_FIELDS_LIST;

  // 1) Validate input → Result<FormSuccess<{ email; password: username }>, ValidationError>
  const validated = await validateFormGeneric(formData, SignupSchema, fields, {
    loggerContext: LOGGER_CONTEXT,
  });

  if (!validated.ok) {
    return toFormValidationErr<SignupField, unknown>({
      failureMessage: validated.error.message,
      fieldErrors: validated.error.fieldErrors,
      fields,
      raw: Object.fromEntries(formData.entries()),
    });
  }

  // 2) Authenticate
  const input = {
    email: validated.value.data.email,
    password: validated.value.data.password,
    username: validated.value.data.username,
  };

  const service = new UserAuthFlowService(getAppDb());
  const res = await service.signup(input);

  if (!res.ok) {
    // Domain error → generic form validation error for UI
    const dense = setSingleFieldErrorMessage(
      fields,
      "Signup failed. Please try again.",
    );
    return toFormValidationErr<SignupField, unknown>({
      fieldErrors: dense,
      fields,
      raw: Object.fromEntries(formData.entries()),
    });
  }

  // 3) Session + redirect
  try {
    await setSessionToken(toUserId(res.value.id), toUserRole(res.value.role));
  } catch (err: unknown) {
    serverLogger.error({
      context: LOGGER_CONTEXT_SESSION,
      error:
        err instanceof Error
          ? { message: err.message, name: err.name }
          : { message: "Unknown error" },
      message: "Failed to establish session",
    });
    const dense = setSingleFieldErrorMessage(
      fields,
      "Unexpected error. Please try again.",
    );
    return toFormValidationErr<SignupField, unknown>({
      fieldErrors: dense,
      fields,
      raw: Object.fromEntries(formData.entries()),
    });
  }

  // success path: small ok result before redirect (useful for progressive enhancement)
  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<SignupField, unknown>({});
}
