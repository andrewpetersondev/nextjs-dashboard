// src/server/auth/application/actions/signup.action.ts
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
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { PerformanceTracker } from "@/server/auth/application/actions/utils/performance-tracker";
import { getRequestMetadata } from "@/server/auth/application/actions/utils/request-metadata";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/domain/errors/auth-error.logging";
import { getAppDb } from "@/server/db/db.connection";
import { validateForm } from "@/server/forms/validate-form";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { Result } from "@/shared/core/result/result";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
import { mapResultToFormResult } from "@/shared/forms/state/mappers/result-to-form.mapper";
import { type Logger, logger } from "@/shared/logging/logger.shared";
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
  const actionLogger = logger.withContext(ctx.context).withRequest(requestId);
  const tracker = new PerformanceTracker();

  actionLogger.info("Signup action initiated", { ip, userAgent });

  // Validation phase
  const validated = await tracker.measure("validation", () =>
    validateForm(formData, SignupSchema, fields, {
      loggerContext: ctx.context,
    }),
  );

  if (!validated.ok) {
    logValidationFailure(actionLogger, validated, tracker, ip);
    return validated;
  }

  const input: SignupData = validated.value.data;
  actionLogger.info("Signup form validated", { email: input.email });

  // Authentication phase
  const service = createAuthUserService(getAppDb());
  const sessionResult = await tracker.measure("authentication", () =>
    executeAuthPipeline(input, service.signup.bind(service)),
  );

  if (!sessionResult.ok) {
    logAuthenticationFailure(actionLogger, sessionResult, {
      email: input.email,
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
  actionLogger.info("User created successfully", { role, userId });

  actionLogger.info("Signup completed successfully", {
    ...tracker.getMetrics(),
    role,
    userId,
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}

function logValidationFailure(
  actionLogger: Logger,
  validated: FormResult<SignupField>,
  tracker: PerformanceTracker,
  ip: string,
) {
  if (validated.ok) {
    return;
  }

  actionLogger.warn("Signup validation failed", {
    duration: tracker.getTotalDuration(),
    errorCount: Object.keys(validated.error.details?.fieldErrors || {}).length,
    ip,
  });
}

function logAuthenticationFailure(
  actionLogger: Logger,
  sessionResult: Result<SessionUser, AppError>,
  context: { email: string; tracker: PerformanceTracker; ip: string },
) {
  if (sessionResult.ok) {
    return;
  }

  actionLogger.error("Signup authentication failed", {
    ...context.tracker.getMetrics(),
    email: context.email,
    errorCode: sessionResult.error.code,
    errorMessage: sessionResult.error.message,
    ip: context.ip,
  });
}
