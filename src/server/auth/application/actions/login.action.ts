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
import { logger } from "@/shared/logging/logger.shared";
import { ROUTES } from "@/shared/routes/routes";

const fields = LOGIN_FIELDS_LIST;
const requestId = crypto.randomUUID();
const actionLogger = logger
  .withContext(AUTH_ACTION_CONTEXTS.login.context)
  .withRequest(requestId);

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

  actionLogger.debug("Login action initiated");

  const validated = await validateForm(formData, LoginSchema, fields, {
    loggerContext: ctx.context,
  });

  if (!validated.ok) {
    actionLogger.warn("Login validation failed", {
      errors: validated.error,
    });
    return validated;
  }

  const input: LoginData = validated.value.data;
  actionLogger.debug("Login form validated successfully", {
    email: input.email,
  });

  const service = createAuthUserService(getAppDb());

  const sessionResult = await executeAuthPipeline(
    input,
    service.login.bind(service),
  );

  if (!sessionResult.ok) {
    actionLogger.error("Login authentication failed", {
      email: input.email,
      errorCode: sessionResult.error.code,
      errorMessage: sessionResult.error.message,
    });

    return mapResultToFormResult(sessionResult, {
      failureMessage: "Login failed. Please try again.",
      fields,
      raw: input,
    });
  }

  const { id: userId, role } = sessionResult.value;
  actionLogger.info("User logged in successfully", {
    role,
    userId,
  });

  (await cookies()).set("login-success", "true", {
    httpOnly: true,
    maxAge: 10,
    sameSite: "lax",
  });

  actionLogger.debug("Session cookie set, redirecting to dashboard");

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
