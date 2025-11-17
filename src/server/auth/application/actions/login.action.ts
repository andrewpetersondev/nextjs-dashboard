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
  type AuthLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging/auth-layer-context";
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
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: login flow is inherently multi-step
export async function loginAction(
  _prevState: FormResult<LoginField>,
  formData: FormData,
): Promise<FormResult<LoginField>> {
  const requestId = crypto.randomUUID();
  const { ip, userAgent } = await getRequestMetadata();

  // Create a unified action-layer context for this request.
  const actionContext: AuthLayerContext<"action"> = createAuthOperationContext({
    identifiers: { ip },
    layer: "action",
    operation: "login",
  });

  const actionLogger = logger
    .withContext(actionContext.context)
    .withRequest(requestId);

  const tracker = new PerformanceTracker();

  // Start
  actionLogger.operation("info", "Login action started", {
    ...ctx.start(),
    context: actionContext.context,
    details: ctx.initiatedPayload({ ip, userAgent }),
    identifiers: actionContext.identifiers,
    operation: actionContext.operation,
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, LoginSchema, fields, {
      loggerContext: actionContext.context,
    }),
  );

  if (!validated.ok) {
    const errorCount = Object.keys(
      validated.error.details?.fieldErrors || {},
    ).length;

    // Validation failure
    actionLogger.operation("warn", "Login validation failed", {
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

  const input: LoginData = validated.value.data;

  // You can enrich identifiers as you go if desired:
  const enrichedContext: AuthLayerContext<"action"> = {
    ...actionContext,
    identifiers: { ...actionContext.identifiers, email: input.email },
  };

  // Validation complete
  actionLogger.operation("info", "Login form validated", {
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
    executeAuthPipeline(input, service.login.bind(service)),
  );

  if (!sessionResult.ok) {
    // Authentication failure
    actionLogger.operation("error", "Login authentication failed", {
      ...ctx.fail("authentication_failed"),
      context: enrichedContext.context,
      details: {
        ...tracker.getMetrics(),
        email: input.email,
        errorCode: sessionResult.error.code,
        errorMessage: sessionResult.error.message,
        ip,
      },
      identifiers: enrichedContext.identifiers,
      operation: enrichedContext.operation,
    });

    return mapResultToFormResult(sessionResult, {
      failureMessage: "Login failed. Please try again.",
      fields,
      raw: input,
    });
  }

  const { id: userId, role } = sessionResult.value;

  // Success
  actionLogger.operation("info", "Login action completed successfully", {
    ...ctx.successAction(userId),
    context: enrichedContext.context,
    details: ctx.successPayload({ role, tracker, userId }),
    identifiers: { ...enrichedContext.identifiers, userId },
    operation: enrichedContext.operation,
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
