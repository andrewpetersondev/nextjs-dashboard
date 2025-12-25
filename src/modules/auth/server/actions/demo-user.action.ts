"use server";

import { redirect } from "next/navigation";
import { createCreateDemoUserUseCaseFactory } from "@/modules/auth/server/application/factories/create-demo-user-use-case.factory";
import { createSessionServiceFactory } from "@/modules/auth/server/application/factories/session-service.factory";
import { createUnitOfWorkFactory } from "@/modules/auth/server/application/factories/unit-of-work.factory";
import { createDemoUserWorkflow } from "@/modules/auth/server/application/workflows/create-demo-user.workflow";
import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/shared/ui/auth-error-messages";
import { getAppDb } from "@/server/db/db.connection";
import type { DenseFieldErrorMap } from "@/shared/forms/core/types/field-error.value";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";
import { getRequestMetadata } from "@/shared/http/request-metadata";
import { logger as defaultLogger } from "@/shared/logging/infrastructure/logging.client";
import { PerformanceTracker } from "@/shared/observability/performance-tracker";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Internal helper: creates a demo user for the given role.
 * Used by both role-specific adapters.
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
    operationContext: "authentication",
    operationIdentifiers: { ip, role },
    operationName: "demoUser.start",
  });

  const uow = createUnitOfWorkFactory(getAppDb(), logger, requestId);
  const createDemoUserUseCase = createCreateDemoUserUseCaseFactory(uow, logger);
  const sessionService = createSessionServiceFactory(logger, requestId);

  const sessionResult = await tracker.measure("authentication", () =>
    createDemoUserWorkflow(role, { createDemoUserUseCase, sessionService }),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logger.errorWithDetails("Demo user creation failed", error, {
      duration: tracker.getTotalDuration(),
      operationContext: "authentication",
      operationIdentifiers: { ip, role },
      operationName: "demoUser.failed",
    });

    return makeFormError({
      fieldErrors: {} as DenseFieldErrorMap<string, string>,
      message: error.message || AUTH_ERROR_MESSAGES.DEMO_USER_FAILED,
    });
  }

  logger.operation("info", "Demo user created successfully", {
    duration: tracker.getTotalDuration(),
    operationContext: "authentication",
    operationIdentifiers: { ip, role },
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
    return makeFormError({
      fieldErrors: {} as DenseFieldErrorMap<string, string>,
      message: AUTH_ERROR_MESSAGES.DEMO_USER_FAILED,
    });
  }

  return await createDemoUserInternal(role);
}
