"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuthUserServiceFactory } from "@/modules/auth/server/application/factories/auth-user-service.factory";
import { createSessionServiceFactory } from "@/modules/auth/server/application/factories/session-service.factory";
import { loginWorkflow } from "@/modules/auth/server/application/workflows/login.workflow";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
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

const fields = LOGIN_FIELDS_LIST;

/**
 * Next.js Server Action boundary:
 * - validate form
 * - call workflow
 * - unwrap Result into FormResult/redirect
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: login boundary is inherently multi-step (validation + orchestration + mapping)
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

  const authUserService = createAuthUserServiceFactory(
    getAppDb(),
    logger,
    requestId,
  );

  const sessionService = createSessionServiceFactory(logger, requestId);

  const sessionResult = await tracker.measure("authentication", () =>
    loginWorkflow(input, { authUserService, sessionService }),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logger.operation("error", "Login authentication failed", {
      duration: tracker.getTotalDuration(),
      error,
      operationIdentifiers: { email: input.email, ip },
      operationName: "login.authentication.failed",
    });

    const { fieldErrors, message } = toFormErrorPayload<LoginField>(error);

    // If it's a credential error (unified by the workflow), apply to both fields for security
    if (error.code === "invalidCredentials") {
      return makeFormError<LoginField>({
        code: error.code,
        fieldErrors: {
          email: [message],
          password: [message],
        },
        message,
        values: input,
      });
    }

    return makeFormError<LoginField>({
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
