"use server";
import { redirect } from "next/navigation";
import { createDemoUserWorkflow } from "@/modules/auth/application/demo/create-demo-user.workflow";
import { authUnitOfWorkFactory } from "@/modules/auth/infrastructure/persistence/factories/auth-unit-of-work.factory";
import { demoUserUseCaseFactory } from "@/modules/auth/infrastructure/persistence/factories/demo-user-use-case.factory";
import { sessionServiceFactory } from "@/modules/auth/infrastructure/session/factories/session-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import type { UserRole } from "@/shared/domain/user/user-role.schema";
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

  const uow = authUnitOfWorkFactory(getAppDb(), logger, requestId);
  const demoUserUseCase = demoUserUseCaseFactory(uow, logger);
  const sessionService = sessionServiceFactory(logger, requestId);

  const sessionResult = await tracker.measure("authentication", () =>
    createDemoUserWorkflow(role, { demoUserUseCase, sessionService }),
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
      formData: {},
      formErrors: [error.message || "demo user creation failed"],
      key: error.key,
      message: error.message || "demo user creation failed.",
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
export async function demoUserAction(
  _prevState: FormResult<never>,
  formData: FormData,
): Promise<FormResult<never>> {
  const role = formData.get("role") as UserRole | null;

  if (!role) {
    return makeFormError({
      fieldErrors: {} as DenseFieldErrorMap<string, string>,
      formData: {},
      formErrors: ["demo user creation failed: invalid role."],
      key: "validation",
      message: "demo user creation failed: invalid role.",
    });
  }

  return await createDemoUserInternal(role);
}
