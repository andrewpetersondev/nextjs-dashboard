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
import { validateForm } from "@/server/forms/validate-form";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
import { mapResultToFormResult } from "@/shared/forms/state/mappers/result-to-form.mapper";
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
  const ctx = AUTH_ACTION_CONTEXTS.SIGNUP;

  console.info(ctx.START());

  const validated = await validateForm(formData, SignupSchema, fields, {
    loggerContext: ctx.CONTEXT,
  });

  if (!validated.ok) {
    console.error("signup validation failed");

    return validated;
  }

  const input: SignupData = validated.value.data;
  const service = createAuthUserService(getAppDb());

  const sessionResult = await executeAuthPipeline(
    input,
    service.signup.bind(service),
  );

  if (!sessionResult.ok) {
    console.error("signup failed");

    return mapResultToFormResult(sessionResult, {
      failureMessage: "Signup failed. Please try again.",
      fields,
      raw: input,
    });
  }

  console.info("user signed up successfully");

  (await cookies()).set("signup-success", "true", {
    httpOnly: true,
    maxAge: 10,
    sameSite: "lax",
  });

  revalidatePath(ROUTES.DASHBOARD.ROOT);
  redirect(ROUTES.DASHBOARD.ROOT);
}
