"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LoginField } from "@/modules/auth/application/dtos/auth-ui.dto";
import { loginWorkflow } from "@/modules/auth/application/services/orchestrators/login.workflow";
import {
  type AuthLoginSchemaDto,
  LOGIN_FIELDS_LIST,
  LoginSchema,
} from "@/modules/auth/domain/schemas/auth-user.schema";
import { mapLoginErrorToFormResult } from "@/modules/auth/infrastructure/actions/auth-form-error.adapter";
import { createLoginUseCaseFactory } from "@/modules/auth/infrastructure/factories/login-use-case.factory";
import { createSessionServiceFactory } from "@/modules/auth/infrastructure/factories/session-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { extractFieldErrors } from "@/shared/forms/logic/inspectors/form-error.inspector";
import { validateForm } from "@/shared/forms/server/validate-form.logic";
import { getRequestMetadata } from "@/shared/http/request-metadata";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import { PerformanceTracker } from "@/shared/observability/performance-tracker";
import { ROUTES } from "@/shared/routes/routes";

const fields = LOGIN_FIELDS_LIST;

/**
 * Next.js Server Action boundary for user authentication.
 *
 * Orchestrates form validation, authentication workflow execution,
 * and result mapping to UI-compatible FormResult or Next.js redirect.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Server Action boundary requires validation, orchestration, logging, and result mapping
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

  const input: AuthLoginSchemaDto = validated.value.data;

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

    return mapLoginErrorToFormResult(error, input);
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
