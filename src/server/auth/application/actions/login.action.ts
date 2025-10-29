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
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/domain/errors/auth-error.logging";
import { getAppDb } from "@/server/db/db.connection";
import { validateForm } from "@/server/forms/validate-form";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
import { mapResultToFormResult } from "@/shared/forms/state/mappers/result-to-form.mapper";
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
  _prevState: FormResult<LoginField>,
  formData: FormData,
): Promise<FormResult<LoginField>> {
  const ctx = AUTH_ACTION_CONTEXTS.login;

  const validated = await validateForm(formData, LoginSchema, fields, {
    loggerContext: ctx.context,
  });

  if (!validated.ok) {
    console.error("login validation error");
    return validated;
  }

  const input: LoginData = validated.value.data;
  const service = createAuthUserService(getAppDb());

  const sessionResult = await executeAuthPipeline(
    input,
    service.login.bind(service),
  );

  if (!sessionResult.ok) {
    console.error("login failed");

    return mapResultToFormResult(sessionResult, {
      failureMessage: "Login failed. Please try again.",
      fields,
      raw: input,
    });
  }

  console.info("user logged in successfully");

  (await cookies()).set("login-success", "true", {
    httpOnly: true,
    maxAge: 10,
    sameSite: "lax",
  });

  revalidatePath(ROUTES.dashboard.ROOT);
  redirect(ROUTES.dashboard.ROOT);
}
