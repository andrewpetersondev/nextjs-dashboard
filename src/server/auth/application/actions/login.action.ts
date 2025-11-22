// File: 'src/server/auth/application/actions/login.action.ts'
// Summary: Use mapper without a fallback parameter; return only plain POJOs to the client.
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
  type AuthLogLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging-auth/auth-layer-context";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/logging-auth/auth-logging.ops";
import { getAppDb } from "@/server/db/db.connection";
import { validateForm } from "@/server/forms/validate-form";
import { mapBaseErrorToFormPayload } from "@/shared/errors/forms/base-error.mappers";
import { formError } from "@/shared/forms/domain/form-result.factory";
import type { FormResult } from "@/shared/forms/domain/form-result.types";
import { logger } from "@/shared/logging/infra/logger.shared";
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
  const actionContext: AuthLogLayerContext<"action"> =
    createAuthOperationContext({
      identifiers: { ip },
      layer: "action",
      operation: "login",
    });

  const actionLogger = logger
    .withContext(actionContext.loggerContext)
    .withRequest(requestId);

  const tracker = new PerformanceTracker();

  // Start
  actionLogger.operation("info", "Login action started", {
    ...ctx.start(),
    context: actionContext.loggerContext,
    details: ctx.initiatedPayload({ ip, userAgent }),
    identifiers: actionContext.identifiers,
    operation: actionContext.operation,
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, LoginSchema, fields, {
      loggerContext: actionContext.loggerContext,
    }),
  );

  if (!validated.ok) {
    const errorCount = Object.keys(validated.error?.fieldErrors || {}).length;

    // Validation failure
    actionLogger.operation("warn", "Login validation failed", {
      ...ctx.validationFailed({ errorCount, ip }),
      context: actionContext.loggerContext,
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
  const enrichedContext: AuthLogLayerContext<"action"> = {
    ...actionContext,
    identifiers: { ...actionContext.identifiers, email: input.email },
  };

  // Validation complete
  actionLogger.operation("info", "Login form validated", {
    operationContext: enrichedContext.loggerContext,
    operationIdentifiers: enrichedContext.identifiers,
    operationName: enrichedContext.operation,
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
    const error = sessionResult.error;

    actionLogger.operation("error", "Login authentication failed", {
      ...ctx.fail("authentication_failed"),
      context: enrichedContext.loggerContext,
      details: {
        email: input.email,
        errorCode: error.code,
        errorMessage: error.message,
        ip,
        ...tracker.getMetrics(),
      },
      identifiers: enrichedContext.identifiers,
      operation: enrichedContext.operation,
    });

    const { fieldErrors, message } =
      mapBaseErrorToFormPayload<LoginField>(error);

    return formError<LoginField>({
      code: error.code,
      fieldErrors,
      message,
      values: input,
    });
  }

  const { id: userId, role } = sessionResult.value;

  // Success
  actionLogger.operation("info", "Login action completed successfully", {
    ...ctx.successAction(userId),
    context: enrichedContext.loggerContext,
    details: ctx.successPayload({ role, tracker, userId }),
    identifiers: { ...enrichedContext.identifiers, userId },
    operation: enrichedContext.operation,
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
