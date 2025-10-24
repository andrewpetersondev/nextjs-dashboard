"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
  type SignupField,
  SignupSchema,
} from "@/features/auth/lib/auth.schema";
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/domain/errors/auth-error.logging";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import type { FormResult } from "@/shared/forms/core/types";
import { extractFormDataFields } from "@/shared/forms/fields/formdata.extractor";
import { toFormError } from "@/shared/forms/state/mappers/result-to-form.mapper";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/validation/error-map";
import { ROUTES } from "@/shared/routes/routes";

const fields = SIGNUP_FIELDS_LIST;

/**
 * Handles the signup action by validating form data, creating the user,
 * establishing a session, and redirecting on success.
 *
 * Flow:
 * - Validate form → if invalid, return FormResult with field errors.
 * - Signup → map Ok(user) to { id, role } only.
 * - Establish session → on failure, map to UI-safe FormResult.
 * - Redirect to dashboard on success.
 *
 * @returns FormResult on validation/auth errors, never returns on success (redirects)
 */
export async function signupAction(
  _prevState: FormResult<SignupField>,
  formData: FormData,
): Promise<FormResult<SignupField>> {
  const raw = extractFormDataFields<SignupField>(formData, fields);

  const validated = await validateFormGeneric(formData, SignupSchema, fields, {
    loggerContext: AUTH_ACTION_CONTEXTS.SIGNUP.CONTEXT,
  });

  if (!validated.ok) {
    return toFormError<SignupField>({
      failureMessage: validated.error.message,
      fieldErrors:
        validated.error.details?.fieldErrors ??
        createEmptyDenseFieldErrorMap<SignupField, string>(fields),
      fields,
      raw,
    });
  }

  const input: SignupData = validated.value.data;
  const service = createAuthUserService(getAppDb());

  const sessionResult = await executeAuthPipeline(
    input,
    service.signup.bind(service),
  );

  if (!sessionResult.ok) {
    // No need for appErrorToFormResult anymore - service returns form-aware errors
    return toFormError<SignupField>({
      failureMessage:
        sessionResult.error.message || "Login failed. Please try again.",
      fieldErrors:
        sessionResult.error.details?.fieldErrors ??
        createEmptyDenseFieldErrorMap<SignupField, string>(fields),
      fields,
      raw,
    });
  }

  (await cookies()).set("signup-success", "true", {
    httpOnly: true,
    maxAge: 10,
    sameSite: "lax",
  });

  revalidatePath(ROUTES.DASHBOARD.ROOT);
  redirect(ROUTES.DASHBOARD.ROOT);
}
