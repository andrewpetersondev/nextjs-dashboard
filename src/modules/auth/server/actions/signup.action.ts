"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCreateUserUseCaseFactory } from "@/modules/auth/server/application/factories/create-user-use-case.factory";
import { createSessionServiceFactory } from "@/modules/auth/server/application/factories/session-service.factory";
import { createUnitOfWorkFactory } from "@/modules/auth/server/application/factories/unit-of-work.factory";
import { signupWorkflow } from "@/modules/auth/server/application/workflows/signup.workflow";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
  type SignupField,
  SignupSchema,
} from "@/modules/auth/shared/domain/user/auth.schema";
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/shared/ui/auth-error-messages";
import { getAppDb } from "@/server/db/db.connection";
import { toFormErrorPayload } from "@/shared/forms/adapters/form-error.adapter";
import { makeFormError } from "@/shared/forms/factories/form-result.factory";
import { validateForm } from "@/shared/forms/server/validate-form.action";
import type { FormResult } from "@/shared/forms/types/form-result.dto";
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

  const uow = createUnitOfWorkFactory(getAppDb(), logger, requestId);
  const createUserUseCase = createCreateUserUseCaseFactory(uow, logger);
  const sessionService = createSessionServiceFactory(logger, requestId);

  const sessionResult = await tracker.measure("authentication", () =>
    signupWorkflow(input, { createUserUseCase, sessionService }),
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

    const { fieldErrors, message } = toFormErrorPayload<SignupField>(error);

    return makeFormError<SignupField>({
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
