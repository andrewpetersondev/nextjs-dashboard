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
import type { SessionUser } from "@/features/auth/sessions/session-action.types";
import { handleAuthError } from "@/server/auth/application/actions/auth-error-handler";
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/domain/constants/auth.constants";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { pickFormDataFields } from "@/shared/forms/fields/formdata.extractor";
import { toFormValidationErr } from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-result.types";
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
  _prevState: FormResult<SignupField, SessionUser>,
  formData: FormData,
): Promise<FormResult<SignupField, SessionUser>> {
  const raw = pickFormDataFields<SignupField>(formData, fields);

  const validated = await validateFormGeneric(formData, SignupSchema, fields, {
    loggerContext: AUTH_ACTION_CONTEXTS.SIGNUP,
  });

  if (!validated.ok) {
    return toFormValidationErr<SignupField, SessionUser>({
      failureMessage: validated.error.message,
      fieldErrors: validated.error.fieldErrors,
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

  if (sessionResult.ok) {
    (await cookies()).set("signup-success", "true", {
      httpOnly: true,
      maxAge: 10, // 10 seconds - gives user time to see toast even with slow loads
      sameSite: "lax",
    });

    revalidatePath(ROUTES.DASHBOARD.ROOT);
    redirect(ROUTES.DASHBOARD.ROOT);
  }
  return handleAuthError<SignupField, SessionUser>(
    sessionResult.error,
    fields,
    raw,
    "email",
  );
}
