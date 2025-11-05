// src/server/auth/application/actions/signup.action.ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
  type SignupField,
  SignupSchema,
} from "@/features/auth/lib/auth.schema";
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import {
  logActionInitiated,
  logActionSuccess,
  logAuthenticationFailure,
  logValidationComplete,
  logValidationFailure,
} from "@/server/auth/application/actions/utils/action-logger.helper";
import { PerformanceTracker } from "@/server/auth/application/actions/utils/performance-tracker";
import { getRequestMetadata } from "@/server/auth/application/actions/utils/request-metadata";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/domain/errors/auth-error.logging";
import { getAppDb } from "@/server/db/db.connection";
import { validateForm } from "@/server/forms/validate-form";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
import { mapResultToFormResult } from "@/shared/forms/state/mappers/result-to-form.mapper";
import { LoggerAdapter } from "@/shared/logging/logger.adapter";
import { logger as sharedLogger } from "@/shared/logging/logger.shared";
import { ROUTES } from "@/shared/routes/routes";

const fields = SIGNUP_FIELDS_LIST;
const ctx = AUTH_ACTION_CONTEXTS.signup;

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
  const requestId = crypto.randomUUID();
  const { ip, userAgent } = await getRequestMetadata();
  const actionLogger = new LoggerAdapter(sharedLogger)
    .withContext(ctx.context)
    .withRequest(requestId);
  const tracker = new PerformanceTracker();

  logActionInitiated(actionLogger, { ip, userAgent });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, SignupSchema, fields, {
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

  const input: SignupData = validated.value.data;
  logValidationComplete(actionLogger, {
    duration: tracker.getLastDuration("validation"),
    email: input.email,
  });

  const service = createAuthUserService(getAppDb());
  const sessionResult = await tracker.measure("authentication", () =>
    executeAuthPipeline(input, service.signup.bind(service)),
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
      failureMessage: "Signup failed. Please try again.",
      fields,
      raw: input,
    });
  }
  const { id: userId, role } = sessionResult.value;
  logActionSuccess(actionLogger, { role, tracker, userId });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
