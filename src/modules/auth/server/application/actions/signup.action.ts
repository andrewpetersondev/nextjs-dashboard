"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthLog, logAuth } from "@/modules/auth/domain/logging/auth-log";
import {
  SIGNUP_FIELDS_LIST,
  type SignupData,
  type SignupField,
  SignupSchema,
} from "@/modules/auth/lib/auth.schema";
import { executeAuthPipeline } from "@/modules/auth/server/application/actions/auth-pipeline.helper";
import { PerformanceTracker } from "@/modules/auth/server/application/actions/utils/performance-tracker";
import { getRequestMetadata } from "@/modules/auth/server/application/actions/utils/request-metadata";
import { createAuthUserService } from "@/modules/auth/server/application/services/factories/auth-user-service.factory";
import { formError } from "@/modules/forms/domain/factories/create-form-result.factory";
import type { FormResult } from "@/modules/forms/domain/types/form-result.types";
import { validateForm } from "@/modules/forms/server/validate-form";
import { getAppDb } from "@/server-core/db/db.connection";
import { adaptAppErrorToFormPayload } from "@/shared/errors/adapters/forms/form-error.adapter";
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
 * @returns FormResult on validation/auth errors, never returns on success (redirects)
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function signupAction(
  _prevState: FormResult<SignupField>,
  formData: FormData,
): Promise<FormResult<SignupField>> {
  const requestId = crypto.randomUUID();
  const { ip, userAgent } = await getRequestMetadata();
  const tracker = new PerformanceTracker();

  // Start
  logAuth("info", "Signup action started", AuthLog.action.signup.start(), {
    additionalData: { ip, userAgent },
    requestId,
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, SignupSchema, fields),
  );

  if (!validated.ok) {
    const errorCount = Object.keys(
      validated.error?.metadata?.fieldErrors || {},
    ).length;

    // Validation failure
    logAuth(
      "warn",
      "Signup validation failed",
      AuthLog.action.signup.validation({ errorCount, ip }),
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

  const input: SignupData = validated.value.data;

  // Validation complete
  logAuth(
    "info",
    "Signup form validated",
    AuthLog.action.signup.success({
      email: input.email,
      username: input.username,
    }),
    {
      additionalData: {
        duration: tracker.getLastDuration("validation"),
        email: input.email,
      },
      requestId,
    },
  );

  const service = createAuthUserService(getAppDb());
  const sessionResult = await tracker.measure("authentication", () =>
    executeAuthPipeline(input, service.signup.bind(service)),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    // Authentication failure
    logAuth(
      "error",
      "Signup authentication failed",
      AuthLog.action.signup.error(error, {
        email: input.email,
        ip,
        username: input.username,
      }),
      {
        additionalData: {
          ...tracker.getMetrics(),
          email: input.email,
          ip,
        },
        requestId,
      },
    );

    const { message, fieldErrors } =
      adaptAppErrorToFormPayload<SignupField>(error);

    return formError<SignupField>({
      code: error.code,
      fieldErrors,
      message,
      values: input,
    });
  }
  const { id: userId, role } = sessionResult.value;

  // Success
  logAuth(
    "info",
    "Signup action completed successfully",
    AuthLog.action.signup.success({
      email: input.email,
      userId,
      username: input.username,
    }),
    {
      additionalData: {
        role,
        ...tracker.getMetrics(),
      },
      requestId,
    },
  );

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
