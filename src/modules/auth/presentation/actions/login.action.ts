"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS_LIST,
  type LoginRequestDto,
  LoginRequestSchema,
} from "@/modules/auth/application/schemas/login-request.schema";
import { loginWorkflow } from "@/modules/auth/application/use-cases/login.workflow";
import { createLoginUseCase } from "@/modules/auth/infrastructure/composition/create-login-use-case.factory";
import { createSessionService } from "@/modules/auth/infrastructure/composition/create-session-service.factory";
import type { LoginField } from "@/modules/auth/presentation/login.transport";
import { toLoginFormResult } from "@/modules/auth/presentation/mappers/auth-form-error.mapper";
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
    validateForm(formData, LoginRequestSchema, fields),
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

  const input: LoginRequestDto = validated.value.data;

  logger.operation("info", "Login form validated", {
    duration: tracker.getLastDuration("validation"),
    operationContext: "validation",
    operationIdentifiers: { email: input.email, ip },
    operationName: "login.validation.success",
  });

  const loginUseCase = createLoginUseCase(getAppDb(), logger, requestId);

  const sessionService = createSessionService(logger, requestId);

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

    return toLoginFormResult(error, input);
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
