"use server";

import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
  type SignupField,
  SignupSchema,
} from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { UserAuthFlowService } from "@/server/users/auth-flow-service.user";
import { toUserId } from "@/shared/domain/id-converters";
import { attachRootDenseMessageToField } from "@/shared/forms/mapping/error-repo";
import { mapResultToFormState } from "@/shared/forms/state/result-to-form-state";
import type { FormState } from "@/shared/forms/types/form-state";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Signup Server Action for Signup Form
 *
 * Redirecting auth action: returns FormState on failure; redirects on success.
 *
 * @param _prev
 * @param formData
 */
export async function signup(
  _prev: FormState<SignupField, unknown>,
  formData: FormData,
): Promise<FormState<SignupField, unknown>> {
  const fields = SIGNUP_FIELDS_LIST;

  const validated = await validateFormGeneric<
    SignupData,
    SignupField,
    SignupData
  >(formData, SignupSchema, fields, {
    fields,
    loggerContext: "signup.validate",
  });

  // If validation failed, return the FormState produced by validateFormGeneric
  if (!validated.success || !validated.data) {
    return validated;
  }

  try {
    // Use auth-flow service -> repo -> DAL pipeline
    const service = new UserAuthFlowService(getDB());
    const res = await service.authFlowSignupService(validated.data);

    if (!res.success || !res.data) {
      // Map domain/service error into dense field errors for consistent UI handling.
      const dense = attachRootDenseMessageToField(
        fields,
        "Signup failed. Please try again.",
      );
      return mapResultToFormState<SignupField, unknown>(
        { error: dense, success: false },
        { fields, raw: {} },
      );
    }

    // Establish session only after successful signup
    await setSessionToken(toUserId(res.data.id), toUserRole(res.data.role));
  } catch (err) {
    // Unexpected error path: log safely and return a consistent failure state.
    serverLogger.error({
      context: "signup.persist",
      // do not include sensitive data; structure the log minimally
      error:
        // TODO: Other layers should return more specific errors so create strategy that is more specific
        err instanceof Error
          ? { message: err.message, name: err.name }
          : { message: "Unknown error" },
      message: "Unexpected error during signup",
    });

    const dense = attachRootDenseMessageToField(
      fields,
      "Unexpected error. Please try again.",
    );
    return mapResultToFormState<SignupField, unknown>(
      { error: dense, success: false },
      { fields, raw: {} },
    );
  }

  // Redirect on success; never return a value after redirect.
  redirect(ROUTES.DASHBOARD.ROOT);
}
