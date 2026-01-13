"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS_LIST,
  type SignupRequestDto,
  SignupRequestSchema,
} from "@/modules/auth/application/schemas/login-request.schema";
import { signupWorkflow } from "@/modules/auth/application/use-cases/signup.workflow";
import { mapSignupErrorToFormResult } from "@/modules/auth/infrastructure/actions/auth-form-error.adapter";
import { createCreateUserUseCaseFactory } from "@/modules/auth/infrastructure/factories/create-user-use-case.factory";
import { createSessionServiceFactory } from "@/modules/auth/infrastructure/factories/session-service.factory";
import { createUnitOfWorkFactory } from "@/modules/auth/infrastructure/factories/unit-of-work.factory";
import type { SignupField } from "@/modules/auth/presentation/signup.transport";
import { getAppDb } from "@/server/db/db.connection";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { extractFieldErrors } from "@/shared/forms/logic/inspectors/form-error.inspector";
import { validateForm } from "@/shared/forms/server/validate-form.logic";
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
  _prevState: FormResult<unknown>,
  formData: FormData,
): Promise<FormResult<never>> {
  const requestId = crypto.randomUUID();
  const { ip, userAgent } = await getRequestMetadata();
  const tracker = new PerformanceTracker();

  const logger = defaultLogger
    .withContext("auth:action")
    .withRequest(requestId)
    .child({ ip, userAgent });

  logger.operation("info", "Signup action started", {
    operationContext: "authentication",
    operationIdentifiers: { ip },
    operationName: "signup.start",
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, SignupRequestSchema, fields),
  );

  if (!validated.ok) {
    const fieldErrors = extractFieldErrors<SignupField>(validated.error) || {};
    const errorCount = Object.keys(fieldErrors).length;

    logger.operation("warn", "Signup validation failed", {
      duration: tracker.getTotalDuration(),
      errorCount,
      operationContext: "validation",
      operationIdentifiers: { ip },
      operationName: "signup.validation.failed",
    });

    return validated;
  }

  const input = validated.value.data satisfies SignupRequestDto;

  logger.operation("info", "Signup form validated", {
    duration: tracker.getLastDuration("validation"),
    operationContext: "validation",
    operationIdentifiers: { email: input.email },

    operationName: "signup.validation.success",
  });

  const uow = createUnitOfWorkFactory(getAppDb(), logger, requestId);
  const signupUseCase = createCreateUserUseCaseFactory(uow, logger);
  const sessionService = createSessionServiceFactory(logger, requestId);

  const sessionResult = await tracker.measure("authentication", () =>
    signupWorkflow(input, { sessionService, signupUseCase }),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logger.errorWithDetails("Signup authentication failed", error, {
      duration: tracker.getTotalDuration(),
      operationContext: "authentication",
      operationIdentifiers: {
        email: input.email,
        ip,
        username: input.username,
      },
      operationName: "signup.authentication.failed",
    });

    return mapSignupErrorToFormResult(error, input);
  }

  const { id: userId, role } = sessionResult.value;

  logger.operation("info", "Signup action completed successfully", {
    duration: tracker.getTotalDuration(),
    operationContext: "authentication",
    operationIdentifiers: { email: input.email, role, userId },
    operationName: "signup.success",
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
