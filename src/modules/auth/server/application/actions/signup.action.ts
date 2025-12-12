"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/domain/auth-error-messages.constants";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
  type SignupField,
  SignupSchema,
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

const fields = SIGNUP_FIELDS_LIST;

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
 * @remarks
 * - Transaction ensures user + initial data are created atomically.
 * - Request ID propagates through all layers for observability.
 * - Password is hashed before storage (never stored in plain text).
 *
 * @returns FormResult on validation/auth errors, never returns on success (redirects)
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: signup flow is inherently multi-step
export async function signupAction(
  _prevState: FormResult<SignupField>,
  formData: FormData,
): Promise<FormResult<SignupField>> {
  const requestId = crypto.randomUUID();
  const { ip, userAgent } = await getRequestMetadata();
  const tracker = new PerformanceTracker();

  const logger = defaultLogger
    .withContext("auth:action")
    .withRequest(requestId)
    .child({ ip, userAgent });

  logger.operation("info", "Signup action started", {
    operationName: "signup.start",
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, SignupSchema, fields),
  );

  if (!validated.ok) {
    const errorCount = Object.keys(
      validated.error?.metadata?.fieldErrors || {},
    ).length;

    logger.operation("warn", "Signup validation failed", {
      duration: tracker.getTotalDuration(),
      errorCount,
      operationIdentifiers: { ip },
      operationName: "signup.validation.failed",
    });

    return validated;
  }

  const input: SignupData = validated.value.data;

  logger.operation("info", "Signup form validated", {
    duration: tracker.getLastDuration("validation"),
    operationIdentifiers: { email: input.email },
    operationName: "signup.validation.success",
  });

  const service = createAuthUserServiceFactory(getAppDb(), logger);
  const sessionResult = await tracker.measure("authentication", () =>
    executeAuthPipeline(input, service.signup.bind(service)),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logger.operation("error", "Signup authentication failed", {
      duration: tracker.getTotalDuration(),
      error,
      operationIdentifiers: {
        email: input.email,
        ip,
        username: input.username,
      },
      operationName: "signup.authentication.failed",
    });

    const { fieldErrors, message } =
      adaptAppErrorToFormPayload<SignupField>(error);

    return formError<SignupField>({
      code: error.code,
      fieldErrors,
      message: message || AUTH_ERROR_MESSAGES.SIGNUP_FAILED,
      values: input,
    });
  }
  const { id: userId, role } = sessionResult.value;

  logger.operation("info", "Signup action completed successfully", {
    duration: tracker.getTotalDuration(),
    operationIdentifiers: { email: input.email, role, userId },
    operationName: "signup.success",
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
