"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/features/auth/lib/auth.schema";
import { handleAuthError } from "@/server/auth/application/actions/auth-error-handler";
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/domain/constants/auth.constants";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import type { FormResult } from "@/shared/forms/core/types";
import { extractFormDataFields } from "@/shared/forms/fields/formdata.extractor";
import { toFormError } from "@/shared/forms/state/mappers/result-to-form.mapper";
import { ROUTES } from "@/shared/routes/routes";

const fields = LOGIN_FIELDS_LIST;

/**
 * Handles the login action by validating form data, authenticating the user,
 * establishing a session, and redirecting on success.
 *
 * Flow:
 * - Validate form → if invalid, return FormResult with field errors.
 * - Authenticate → map Ok(user) to { id, role } only.
 * - Establish session → on failure, map to UI-safe FormResult.
 * - Redirect to dashboard on success.
 *
 * @returns FormResult on validation/auth errors, never returns on success (redirects)
 */
export async function loginAction(
  _prevState: FormResult<LoginField, never>,
  formData: FormData,
): Promise<FormResult<LoginField, never>> {
  const raw = extractFormDataFields<LoginField>(formData, fields);

  const validated = await validateFormGeneric(formData, LoginSchema, fields, {
    loggerContext: AUTH_ACTION_CONTEXTS.LOGIN,
  });

  if (!validated.ok) {
    return toFormError<LoginField>({
      failureMessage: validated.error.message,
      fieldErrors: validated.error.fieldErrors,
      fields,
      raw,
    });
  }

  const input: LoginData = validated.value.data;
  const service = createAuthUserService(getAppDb());

  const sessionResult = await executeAuthPipeline(
    input,
    service.login.bind(service),
  );

  if (sessionResult.ok) {
    (await cookies()).set("login-success", "true", {
      httpOnly: true,
      maxAge: 10, // 10 seconds - gives user time to see toast even with slow loads
      sameSite: "lax",
    });

    revalidatePath(ROUTES.DASHBOARD.ROOT);
    redirect(ROUTES.DASHBOARD.ROOT);
  }
  return handleAuthError<LoginField>(sessionResult.error, fields, raw, "email");
}
