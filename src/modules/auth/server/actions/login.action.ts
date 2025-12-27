"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createLoginUseCaseFactory } from "@/modules/auth/server/application/factories/login-use-case.factory";
import { createSessionServiceFactory } from "@/modules/auth/server/application/factories/session-service.factory";
import { loginWorkflow } from "@/modules/auth/server/application/workflows/login.workflow";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/modules/auth/shared/domain/user/auth.schema";
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/ui/auth-error-messages";
import { getAppDb } from "@/server/db/db.connection";
import { toFormErrorPayload } from "@/shared/forms/adapters/form-error.adapter";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";
import { extractFieldErrors } from "@/shared/forms/logic/inspectors/form-error.inspector";
import { validateForm } from "@/shared/forms/server/validate-form.logic";
import { getRequestMetadata } from "@/shared/http/request-metadata";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import { PerformanceTracker } from "@/shared/observability/performance-tracker";
import { ROUTES } from "@/shared/routes/routes";

const fields = LOGIN_FIELDS_LIST;

/**
 * Next.js Server Action boundary:
 * - validate form
 * - call workflow
 * - unwrap Result into FormResult/redirect
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: login boundary is inherently multi-step (validation + orchestration + mapping)
export async function loginAction(
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

  logger.operation("info", "Login action started", {
    operationContext: "authentication",
    operationIdentifiers: { ip },
    operationName: "login.start",
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, LoginSchema, fields),
  );

  if (!validated.ok) {
    const fieldErrors = extractFieldErrors<LoginField>(validated.error) || {};
    const errorCount = Object.keys(fieldErrors).length;

    logger.operation("warn", "Login validation failed", {
      duration: tracker.getTotalDuration(),
      errorCount,
      operationContext: "validation",
      operationIdentifiers: { ip },
      operationName: "login.validation.failed",
    });

    return validated;
  }

  const input: LoginData = validated.value.data;

  logger.operation("info", "Login form validated", {
    duration: tracker.getLastDuration("validation"),
    operationContext: "validation",
    operationIdentifiers: { email: input.email, ip },
    operationName: "login.validation.success",
  });

  const loginUseCase = createLoginUseCaseFactory(getAppDb(), logger, requestId);

  const sessionService = createSessionServiceFactory(logger, requestId);

  const sessionResult = await tracker.measure("authentication", () =>
    loginWorkflow(input, { loginUseCase, sessionService }),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logger.errorWithDetails("Login authentication failed", error, {
      duration: tracker.getTotalDuration(),
      operationContext: "authentication",
      operationIdentifiers: { email: input.email, ip },
      operationName: "login.authentication.failed",
    });

    const payload = toFormErrorPayload<LoginField>(error, fields);

    // Unified security response for credential failures
    if (error.key === "invalid_credentials") {
      const credentialsErrorMessage = AUTH_ERROR_MESSAGES.LOGIN_FAILED;

      return makeFormError<LoginField>({
        ...payload,
        fieldErrors: {
          email: [credentialsErrorMessage],
          password: [credentialsErrorMessage],
        },
        formData: input,
        formErrors: [credentialsErrorMessage],
        key: error.key,
        message: credentialsErrorMessage,
      });
    }

    return makeFormError<LoginField>({
      ...payload,
      formData: input,
      formErrors:
        payload.formErrors.length > 0 ? payload.formErrors : [payload.message],
      key: error.key,
    });
  }

  const { id: userId, role } = sessionResult.value;

  logger.operation("info", "Login action completed successfully", {
    duration: tracker.getTotalDuration(),
    operationContext: "authentication",
    operationIdentifiers: { email: input.email, ip, role, userId },
    operationName: "login.success",
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
