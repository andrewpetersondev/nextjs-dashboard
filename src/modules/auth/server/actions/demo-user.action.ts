"use server";

import { redirect } from "next/navigation";
import { createAuthUserServiceFactory } from "@/modules/auth/server/application/factories/auth-user-service.factory";
import { createSessionServiceFactory } from "@/modules/auth/server/application/factories/session-service.factory";
import { createDemoUserWorkflow } from "@/modules/auth/server/application/workflows/create-demo-user.workflow";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/shared/ui/auth-error-messages";
import { getAppDb } from "@/server/db/db.connection";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { formError } from "@/shared/forms/utilities/factories/create-form-result.factory";
import { getRequestMetadata } from "@/shared/http/request-metadata";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
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

  const logger = defaultLogger
    .withContext("auth:action")
    .withRequest(requestId)
    .child({ ip, role, userAgent });

  logger.operation("info", "Demo user action started", {
    operationName: "demoUser.start",
  });

  const authUserService = createAuthUserServiceFactory(
    getAppDb(),
    logger,
    requestId,
  );
  const sessionService = createSessionServiceFactory(logger);

  const sessionResult = await tracker.measure("authentication", () =>
    createDemoUserWorkflow(role, { authUserService, sessionService }),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logger.operation("error", "Demo user creation failed", {
      error,
      operationIdentifiers: { ip, role },
      operationName: "demoUser.failed",
    });

    return formError({
      fieldErrors: {} as Record<string, readonly string[]>,
      message: error.message || AUTH_ERROR_MESSAGES.DEMO_USER_FAILED,
    });
  }

  logger.operation("info", "Demo user created successfully", {
    operationName: "demoUser.success",
  });

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
