"use server";
import { redirect } from "next/navigation";
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/domain/auth-error-messages.constants";
import { AuthLog, logAuth } from "@/modules/auth/domain/logging/auth-log";
import type { UserRole } from "@/modules/auth/domain/schema/auth.roles";
import { executeAuthPipeline } from "@/modules/auth/server/application/actions/auth-pipeline.helper";
import { createAuthUserServiceFactory } from "@/modules/auth/server/application/services/factories/auth-user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { formError } from "@/shared/forms/utilities/factories/create-form-result.factory";
import { getRequestMetadata } from "@/shared/http/request-metadata";
import { PerformanceTracker } from "@/shared/observability/performance-tracker";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Internal helper: creates a demo user for the given role.
 * Used by both role-specific adapters.
 *
 * @remarks
 * - Demo users receive randomly generated passwords (16 characters).
 * - Transaction ensures user + counter increment are atomic.
 * - Request ID propagates through all layers for observability.
 *
 * @internal
 */
async function createDemoUserInternal(
  role: UserRole,
): Promise<FormResult<never>> {
  const requestId = crypto.randomUUID();
  const { ip, userAgent } = await getRequestMetadata();
  const tracker = new PerformanceTracker();

  logAuth("info", "Demo user action started", AuthLog.action.demoUser.start(), {
    additionalData: { ip, role, userAgent },
    requestId,
  });

  const service = createAuthUserServiceFactory(
    getAppDb(),
    undefined,
    requestId,
  );

  const sessionResult = await tracker.measure("authentication", () =>
    executeAuthPipeline(role, service.createDemoUser.bind(service)),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logAuth(
      "error",
      "Demo user creation failed",
      AuthLog.action.demoUser.error(error, { role }),
      {
        additionalData: {
          ...tracker.getMetrics(),
          ip,
        },
        requestId,
      },
    );

    return formError({
      fieldErrors: {} as Record<string, readonly string[]>,
      message: error.message || AUTH_ERROR_MESSAGES.DEMO_USER_FAILED,
    });
  }

  logAuth(
    "info",
    "Demo user created successfully",
    AuthLog.action.demoUser.success({ role }),
    {
      additionalData: {
        ...tracker.getMetrics(),
      },
      requestId,
    },
  );

  redirect(ROUTES.dashboard.root);
}

/**
 * Server action adapter for creating a demo user.
 * Accepts FormData and extracts the role from the hidden input field.
 *
 * Used by useActionState in demo-form.tsx.
 *
 * @param _prevState - Previous form state (unused, required by useActionState)
 * @param formData - Form data containing the hidden 'role' field
 * @returns FormResult on error, redirects on success
 */
export async function demoUserActionAdapter(
  _prevState: FormResult<never>,
  formData: FormData,
): Promise<FormResult<never>> {
  const role = formData.get("role") as UserRole | null;

  if (!role) {
    return formError({
      fieldErrors: {} as Record<string, readonly string[]>,
      message: AUTH_ERROR_MESSAGES.DEMO_USER_FAILED,
    });
  }

  return await createDemoUserInternal(role);
}
