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
import { PerformanceTracker } from "@/server/auth/application/actions/utils/performance-tracker";
import { getRequestMetadata } from "@/server/auth/application/actions/utils/request-metadata";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/logging/auth-logging.ops";
import { getAppDb } from "@/server/db/db.connection";
import { validateForm } from "@/server/forms/validate-form";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
import { mapResultToFormResult } from "@/shared/forms/state/mappers/result-to-form.mapper";
import { logger } from "@/shared/logging/logger.shared";
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
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function signupAction(
  _prevState: FormResult<SignupField>,
  formData: FormData,
): Promise<FormResult<SignupField>> {
  const requestId = crypto.randomUUID();
  const { ip, userAgent } = await getRequestMetadata();

  const actionLogger = logger.withContext(ctx.context).withRequest(requestId);
  const tracker = new PerformanceTracker();

  // Start
  actionLogger.operation("info", "Signup action started", {
    ...ctx.start(),
    context: ctx.context,
    details: ctx.initiatedPayload({ ip, userAgent }),
    operation: "signup",
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, SignupSchema, fields, {
      loggerContext: ctx.context,
    }),
  );

  if (!validated.ok) {
    const errorCount = Object.keys(
      validated.error.details?.fieldErrors || {},
    ).length;

    // Validation failure
    actionLogger.operation("warn", "Signup validation failed", {
      ...ctx.validationFailed({ errorCount, ip }),
      context: ctx.context,
      details: ctx.validationFailurePayload({
        errorCount,
        ip,
        tracker,
      }),
      operation: "signup",
    });

    return validated;
  }

  const input: SignupData = validated.value.data;

  // Validation complete
  actionLogger.operation("info", "Signup form validated", {
    context: ctx.context,
    operation: "signup",
    ...ctx.validationCompletePayload({
      duration: tracker.getLastDuration("validation"),
      email: input.email,
    }),
  });

  const service = createAuthUserService(getAppDb(), actionLogger);
  const sessionResult = await tracker.measure("authentication", () =>
    executeAuthPipeline(input, service.signup.bind(service)),
  );

  if (!sessionResult.ok) {
    // Authentication failure
    actionLogger.operation("error", "Signup authentication failed", {
      ...ctx.fail("authentication_failed"),
      context: ctx.context,
      details: ctx.authenticationFailurePayload({
        email: input.email,
        errorCode: sessionResult.error.code,
        errorMessage: sessionResult.error.message,
        ip,
        tracker,
      }),
      operation: "signup",
    });

    return mapResultToFormResult(sessionResult, {
      failureMessage: "Signup failed. Please try again.",
      fields,
      raw: input,
    });
  }
  const { id: userId, role } = sessionResult.value;

  // Success
  actionLogger.operation("info", "Signup action completed successfully", {
    ...ctx.successAction(input.email),
    context: ctx.context,
    details: ctx.successPayload({ role, tracker, userId }),
    operation: "signup",
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
