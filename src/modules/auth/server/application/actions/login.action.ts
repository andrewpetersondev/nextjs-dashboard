"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/domain/auth-error-messages.constants";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/modules/auth/domain/schema/auth.schema";
import { executeAuthPipeline } from "@/modules/auth/server/application/actions/auth-pipeline.helper";
import { createAuthUserServiceFactory } from "@/modules/auth/server/application/services/factories/auth-user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { adaptAppErrorToFormPayload } from "@/shared/forms/adapters/form-error.adapter";
import { validateForm } from "@/shared/forms/server/validate-form";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { formError } from "@/shared/forms/utilities/factories/create-form-result.factory";
import { getRequestMetadata } from "@/shared/http/request-metadata";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import { PerformanceTracker } from "@/shared/observability/performance-tracker";
import { ROUTES } from "@/shared/routes/routes";

const fields = LOGIN_FIELDS_LIST;

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
 * @remarks
 * - No transaction needed (read-only operation).
 * - Request ID propagates through all layers for observability.
 * - Password verification happens in service layer.
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
  const tracker = new PerformanceTracker();

  const logger = defaultLogger
    .withContext("auth:action")
    .withRequest(requestId)
    .child({ ip, userAgent });

  logger.operation("info", "Login action started", {
    operationName: "login.start",
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, LoginSchema, fields),
  );

  if (!validated.ok) {
    const errorCount = Object.keys(
      validated.error?.metadata?.fieldErrors || {},
    ).length;

    logger.operation("warn", "Login validation failed", {
      duration: tracker.getTotalDuration(),
      errorCount,
      operationName: "login.validation.failed",
    });

    return validated;
  }

  const input: LoginData = validated.value.data;

  logger.operation("info", "Login form validated", {
    duration: tracker.getLastDuration("validation"),
    operationIdentifiers: { email: input.email },
    operationName: "login.validation.success",
  });

  const service = createAuthUserServiceFactory(getAppDb(), logger);
  const sessionResult = await tracker.measure("authentication", () =>
    executeAuthPipeline(input, service.login.bind(service)),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logger.operation("error", "Login authentication failed", {
      duration: tracker.getTotalDuration(),
      error,
      operationIdentifiers: { email: input.email, ip },
      operationName: "login.authentication.failed",
    });

    const { fieldErrors, message } =
      adaptAppErrorToFormPayload<LoginField>(error);

    return formError<LoginField>({
      code: error.code,
      fieldErrors,
      message: message || AUTH_ERROR_MESSAGES.LOGIN_FAILED,
      values: input,
    });
  }

  const { id: userId, role } = sessionResult.value;

  logger.operation("info", "Login action completed successfully", {
    duration: tracker.getTotalDuration(),
    operationIdentifiers: { email: input.email, role, userId },
    operationName: "login.success",
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
