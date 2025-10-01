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
import { asPasswordRaw } from "@/server/auth/types/password.types";
import { UserAuthFlowService } from "@/server/auth/user-auth.service";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { toUserId } from "@/shared/domain/id-converters";
import { attachRootDenseMessageToField } from "@/shared/forms/errors/error-map-helpers";
import { mapResultToFormState } from "@/shared/forms/mapping/result-to-form-state.mapping";
import type { FormState } from "@/shared/forms/types/form-state.type";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Signup Server Action
 * Validates, creates user, starts session, then redirects.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function signup(
  _prev: FormState<SignupField, unknown>,
  formData: FormData,
): Promise<FormState<SignupField, unknown>> {
  const fields = SIGNUP_FIELDS_LIST;

  const validated = await validateFormGeneric<SignupData, SignupField>(
    formData,
    SignupSchema,
    fields,
    {
      fields,
      loggerContext: "signup.validate",
    },
  );

  // If validation failed, return the FormState produced by validateFormGeneric
  if (!validated.success || !validated.data) {
    return validated;
  }

  try {
    // Brand the raw password at the action boundary for stronger typing downstream
    const brandedInput: SignupData = {
      email: validated.data.email,
      password: asPasswordRaw(validated.data.password as unknown as string),
      username: validated.data.username,
    };

    const service = new UserAuthFlowService(getDB());
    const res = await service.signup(brandedInput);

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
      context: "signup.action",
      error:
        err instanceof Error
          ? { message: err.message, name: err.name }
          : { message: "Unknown error" },
      message: "Unexpected error during signup action",
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
