// src/server/auth/application/actions/login.action.ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/features/auth/lib/auth.schema";
import type { SessionUser } from "@/features/auth/sessions/session-action.types";
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { PerformanceTracker } from "@/server/auth/application/actions/utils/performance-tracker";
import { getRequestMetadata } from "@/server/auth/application/actions/utils/request-metadata";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/domain/errors/auth-error.logging";
import { getAppDb } from "@/server/db/db.connection";
import { validateForm } from "@/server/forms/validate-form";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { Result } from "@/shared/core/result/result";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
import { mapResultToFormResult } from "@/shared/forms/state/mappers/result-to-form.mapper";
import { type Logger, logger } from "@/shared/logging/logger.shared";
import { ROUTES } from "@/shared/routes/routes";

const fields = LOGIN_FIELDS_LIST;
const ctx = AUTH_ACTION_CONTEXTS.login;

export async function loginAction(
  _prevState: FormResult<LoginField>,
  formData: FormData,
): Promise<FormResult<LoginField>> {
  const requestId = crypto.randomUUID();
  const { ip, userAgent } = await getRequestMetadata();
  const actionLogger = logger.withContext(ctx.context).withRequest(requestId);
  const tracker = new PerformanceTracker();

  actionLogger.info("Login action initiated", { ip, userAgent });

  // Validation
  const validated = await tracker.measure("validation", () =>
    validateForm(formData, LoginSchema, fields, {
      loggerContext: ctx.context,
    }),
  );

  if (!validated.ok) {
    logValidationFailure(actionLogger, validated, tracker, ip);
    return validated;
  }

  const input: LoginData = validated.value.data;
  actionLogger.info("Login form validated", { email: input.email });

  // Authentication
  const service = createAuthUserService(getAppDb());
  const sessionResult = await tracker.measure("authentication", () =>
    executeAuthPipeline(input, service.login.bind(service)),
  );

  if (!sessionResult.ok) {
    logAuthenticationFailure(actionLogger, sessionResult, {
      email: input.email,
      ip,
      tracker,
    });
    return mapResultToFormResult(sessionResult, {
      failureMessage: "Login failed. Please try again.",
      fields,
      raw: input,
    });
  }

  const { id: userId, role } = sessionResult.value;
  actionLogger.info("User authenticated successfully", { role, userId });

  actionLogger.info("Login completed successfully", {
    ...tracker.getMetrics(),
    role,
    userId,
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}

function logValidationFailure(
  actionLogger: Logger,
  validated: FormResult<LoginField>,
  tracker: PerformanceTracker,
  ip: string,
) {
  if (validated.ok) {
    return;
  }

  actionLogger.warn("Login validation failed", {
    duration: tracker.getTotalDuration(),
    errorCount: Object.keys(validated.error.details?.fieldErrors || {}).length,
    ip,
  });
}

function logAuthenticationFailure(
  actionLogger: Logger,
  sessionResult: Result<SessionUser, AppError>,
  context: { email: string; tracker: PerformanceTracker; ip: string },
) {
  if (sessionResult.ok) {
    return;
  }

  actionLogger.error("Login authentication failed", {
    ...context.tracker.getMetrics(),
    email: context.email,
    errorCode: sessionResult.error.code,
    errorMessage: sessionResult.error.message,
    ip: context.ip,
  });
}
