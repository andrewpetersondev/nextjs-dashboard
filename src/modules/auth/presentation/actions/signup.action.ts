"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signupWorkflow } from "@/modules/auth/application/authentication/signup.workflow";
import {
  SIGNUP_FIELDS_LIST,
  type SignupRequestDto,
  SignupRequestSchema,
} from "@/modules/auth/application/schemas/login-request.schema";
import { authUnitOfWorkFactory } from "@/modules/auth/infrastructure/persistence/factories/auth-unit-of-work.factory";
import { signupUseCaseFactory } from "@/modules/auth/infrastructure/persistence/factories/signup-use-case.factory";
import { sessionServiceFactory } from "@/modules/auth/infrastructure/session/factories/session-service.factory";
import { toSignupFormResult } from "@/modules/auth/presentation/mappers/auth-form-error.mapper";
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
 * Next.js Server Action for user registration (signup).
 *
 * @remarks
 * This action orchestrates the entire signup flow:
 * 1. Validates the {@link FormData} against {@link SignupRequestSchema}.
 * 2. Executes the {@link signupWorkflow} which handles user creation within a
 *    transaction and session establishment.
 * 3. Tracks performance and logs the outcome (success or failure).
 * 4. Maps domain/application errors to UI-compatible {@link FormResult}.
 * 5. Revalidates the dashboard path and redirects on success.
 *
 * It is intended to be used with the `useActionState` hook in the signup form component.
 *
 * @param _prevState - The previous form state (unused but required by `useActionState`).
 * @param formData - The form data containing registration details (email, password, username).
 * @returns A promise resolving to a {@link FormResult} containing error details if the process fails.
 * @redirects {ROUTES.dashboard.root} on success.
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

  const uow = authUnitOfWorkFactory(getAppDb(), logger, requestId);
  const signupUseCase = signupUseCaseFactory(uow, logger);
  const sessionService = sessionServiceFactory(logger, requestId);

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

    return toSignupFormResult(error, input);
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
