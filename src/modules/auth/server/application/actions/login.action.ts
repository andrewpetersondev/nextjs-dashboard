"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/domain/constants/auth-error-messages.constants";
import { AuthLog, logAuth } from "@/modules/auth/domain/logging/auth-log";
import {
  LOGIN_FIELDS_LIST,
  type LoginData,
  type LoginField,
  LoginSchema,
} from "@/modules/auth/domain/schema/auth.schema";
import { executeAuthPipeline } from "@/modules/auth/server/application/actions/auth-pipeline.helper";
import { PerformanceTracker } from "@/modules/auth/server/application/actions/utils/performance-tracker";
import { getRequestMetadata } from "@/modules/auth/server/application/actions/utils/request-metadata";
import { createAuthUserServiceFactory } from "@/modules/auth/server/application/services/factories/auth-user-service.factory";
import { getAppDb } from "@/server-core/db/db.connection";
import { adaptAppErrorToFormPayload } from "@/shared/forms/adapters/form-error.adapter";
import { validateForm } from "@/shared/forms/server/validate-form";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { formError } from "@/shared/forms/utilities/factories/create-form-result.factory";
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

  logAuth("info", "Login action started", AuthLog.action.login.start(), {
    additionalData: { ip, userAgent },
    requestId,
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, LoginSchema, fields),
  );

  if (!validated.ok) {
    const errorCount = Object.keys(
      validated.error?.metadata?.fieldErrors || {},
    ).length;

    logAuth(
      "warn",
      "Login validation failed",
      AuthLog.action.login.validation({ errorCount, ip }),
      {
        additionalData: {
          duration: tracker.getTotalDuration(),
          errorCount,
          ip,
        },
        requestId,
      },
    );

    return validated;
  }

  const input: LoginData = validated.value.data;

  logAuth(
    "info",
    "Login form validated",
    AuthLog.action.login.success({ email: input.email }),
    {
      additionalData: {
        duration: tracker.getLastDuration("validation"),
        email: input.email,
      },
      requestId,
    },
  );

  const service = createAuthUserServiceFactory(
    getAppDb(),
    undefined,
    requestId,
  );
  const sessionResult = await tracker.measure("authentication", () =>
    executeAuthPipeline(input, service.login.bind(service)),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logAuth(
      "error",
      "Login authentication failed",
      AuthLog.action.login.error(error, { email: input.email, ip }),
      {
        additionalData: {
          ...tracker.getMetrics(),
          email: input.email,
          ip,
        },
        requestId,
      },
    );

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

  logAuth(
    "info",
    "Login action completed successfully",
    AuthLog.action.login.success({ email: input.email, userId }),
    {
      additionalData: {
        ...tracker.getMetrics(),
        role,
      },
      requestId,
    },
  );

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
