// src/server/auth/application/actions/login.action.ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/features/auth/lib/auth.schema";
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { PerformanceTracker } from "@/server/auth/application/actions/utils/performance-tracker";
import { getRequestMetadata } from "@/server/auth/application/actions/utils/request-metadata";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import {
  logActionInitiated,
  logActionSuccess,
  logAuthenticationFailure,
  logValidationComplete,
  logValidationFailure,
} from "@/server/auth/logging/action-logger.helper";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/logging/auth-logging.ops";
import { getAppDb } from "@/server/db/db.connection";
import { validateForm } from "@/server/forms/validate-form";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
import { mapResultToFormResult } from "@/shared/forms/state/mappers/result-to-form.mapper";
import { logger } from "@/shared/logging/logger.shared";
import { ROUTES } from "@/shared/routes/routes";

const fields = LOGIN_FIELDS_LIST;
const ctx = AUTH_ACTION_CONTEXTS.login;

/**
 * Handles the login action by validating form data, finding the user,
 * establishing a session, and redirecting on success.
 *
 * Flow:
 * - Validate form → if invalid, return FormResult with field errors.
 * - Login → map Ok(user) to { id, role } only.
 * - Establish session → on failure, map to UI-safe FormResult.
 * - Redirect to dashboard on success.
 *
 * @returns FormResult on validation/auth errors, never returns on success (redirects)
 */
export async function loginAction(
  _prevState: FormResult<LoginField>,
  formData: FormData,
): Promise<FormResult<LoginField>> {
  const requestId = crypto.randomUUID();
  const { ip, userAgent } = await getRequestMetadata();

  const actionLogger = logger.withContext(ctx.context).withRequest(requestId);
  const tracker = new PerformanceTracker();

  logActionInitiated(actionLogger, { ip, userAgent });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, LoginSchema, fields, {
      loggerContext: ctx.context,
    }),
  );

  if (!validated.ok) {
    logValidationFailure(actionLogger, {
      errorCount: Object.keys(validated.error.details?.fieldErrors || {})
        .length,
      ip,
      tracker,
    });
    return validated;
  }

  const input: LoginData = validated.value.data;
  logValidationComplete(actionLogger, {
    duration: tracker.getLastDuration("validation"),
    email: input.email,
  });

  // Use the action logger (with requestId) for the entire login pipeline
  const service = createAuthUserService(getAppDb(), actionLogger);
  const sessionResult = await tracker.measure("authentication", () =>
    executeAuthPipeline(input, service.login.bind(service)),
  );

  if (!sessionResult.ok) {
    logAuthenticationFailure(actionLogger, {
      email: input.email,
      errorCode: sessionResult.error.code,
      errorMessage: sessionResult.error.message,
      ip,
      tracker,
    });
    return mapResultToFormResult(sessionResult, {
      failureMessage: "Login failed. Please try again.",
      fields,
      raw: input,
    });
  }

  const { id: userId, role } = sessionResult.value;
  logActionSuccess(actionLogger, { role, tracker, userId });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
