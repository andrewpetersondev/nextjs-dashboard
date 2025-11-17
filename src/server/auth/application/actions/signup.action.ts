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
import {
  type AuthLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging/auth-layer-context";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/logging/auth-logging.ops";
import { getAppDb } from "@/server/db/db.connection";
import { validateForm } from "@/server/forms/validate-form";
import { mapBaseErrorToFormPayload } from "@/shared/errors/base-error.mappers";
import { formError } from "@/shared/forms/domain/form-result.factory";
import type { FormResult } from "@/shared/forms/domain/form-result.types";
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

  // Create a unified action-layer context for this request.
  const actionContext: AuthLayerContext<"action"> = createAuthOperationContext({
    identifiers: { ip },
    layer: "action",
    operation: "signup",
  });

  const actionLogger = logger
    .withContext(actionContext.context)
    .withRequest(requestId);

  const tracker = new PerformanceTracker();

  // Start
  actionLogger.operation("info", "Signup action started", {
    ...ctx.start(),
    context: actionContext.context,
    details: ctx.initiatedPayload({ ip, userAgent }),
    identifiers: actionContext.identifiers,
    operation: actionContext.operation,
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, SignupSchema, fields, {
      loggerContext: actionContext.context,
    }),
  );

  if (!validated.ok) {
    const errorCount = Object.keys(validated.error?.fieldErrors || {}).length;

    // Validation failure
    actionLogger.operation("warn", "Signup validation failed", {
      ...ctx.validationFailed({ errorCount, ip }),
      context: actionContext.context,
      details: ctx.validationFailurePayload({
        errorCount,
        ip,
        tracker,
      }),
      identifiers: actionContext.identifiers,
      operation: actionContext.operation,
    });

    return validated;
  }

  const input: SignupData = validated.value.data;

  // You can enrich identifiers as you go if desired:
  const enrichedContext: AuthLayerContext<"action"> = {
    ...actionContext,
    identifiers: {
      ...actionContext.identifiers,
      email: input.email,
      username: input.username,
    },
  };

  // Validation complete
  actionLogger.operation("info", "Signup form validated", {
    context: enrichedContext.context,
    identifiers: enrichedContext.identifiers,
    operation: enrichedContext.operation,
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
    const error = sessionResult.error;

    // Authentication failure
    actionLogger.operation("error", "Signup authentication failed", {
      ...ctx.fail("authentication_failed"),
      context: enrichedContext.context,
      details: {
        ...tracker.getMetrics(),
        email: input.email,
        errorCode: error.code,
        errorMessage: error.message,
        ip,
      },
      identifiers: enrichedContext.identifiers,
      operation: enrichedContext.operation,
    });

    const { message, fieldErrors } =
      mapBaseErrorToFormPayload<SignupField>(error);

    return formError<SignupField>({
      code: error.code,
      fieldErrors,
      message,
      values: input,
    });
  }
  const { id: userId, role } = sessionResult.value;

  // Success
  actionLogger.operation("info", "Signup action completed successfully", {
    ...ctx.successAction(input.email),
    context: enrichedContext.context,
    details: ctx.successPayload({ role, tracker, userId }),
    identifiers: { ...enrichedContext.identifiers, userId },
    operation: enrichedContext.operation,
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
