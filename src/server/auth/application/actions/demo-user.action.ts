"use server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import {
  type AuthLayerContext,
  createAuthOperationContext,
} from "@/server/auth/logging-auth/auth-layer-context";
import { AuthActionLogFactory } from "@/server/auth/logging-auth/auth-logging.contexts";
import { getAppDb } from "@/server/db/db.connection";
import { formError } from "@/shared/forms/domain/form-result.factory";
import type { FormResult } from "@/shared/forms/domain/form-result.types";
import { logger } from "@/shared/logging/logger.shared";
import { ROUTES } from "@/shared/routes/routes";

const DEMO_USER_ERROR_MESSAGE = "Failed to create demo user. Please try again.";

/**
 * Internal helper: creates a demo user for the given role.
 * Used by both role-specific adapters.
 *
 * @internal
 */
async function createDemoUserInternal(
  role: UserRole,
): Promise<FormResult<never>> {
  const actionContext: AuthLayerContext<"action"> = createAuthOperationContext({
    identifiers: { role },
    layer: "action",
    operation: "demoUser",
  });

  const actionLogger = logger.withContext(actionContext.context);

  actionLogger.operation("info", "Demo user creation started", {
    ...AuthActionLogFactory.start(actionContext.operation),
    context: actionContext.context,
    identifiers: actionContext.identifiers,
  });

  const service = createAuthUserService(getAppDb(), actionLogger);

  const sessionResult = await executeAuthPipeline(
    role,
    service.createDemoUser.bind(service),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    actionLogger.operation("error", "Demo user creation failed", {
      ...AuthActionLogFactory.failure(actionContext.operation, {
        role,
      }),
      context: actionContext.context,
      errorCode: error.code,
      errorMessage: error.message,
      identifiers: actionContext.identifiers,
      ...(error.formErrors || error.fieldErrors
        ? {
            errorDetails: {
              ...(error.formErrors && { formErrors: error.formErrors }),
              ...(error.fieldErrors && { fieldErrors: error.fieldErrors }),
            },
          }
        : {}),
    });

    return formError({
      fieldErrors: {} as Record<string, readonly string[]>,
      message: error.message || DEMO_USER_ERROR_MESSAGE,
    });
  }

  actionLogger.operation("info", "Demo user created successfully", {
    ...AuthActionLogFactory.success(actionContext.operation, {
      role,
    }),
    context: actionContext.context,
    identifiers: actionContext.identifiers,
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
      message: DEMO_USER_ERROR_MESSAGE,
    });
  }

  return await createDemoUserInternal(role);
}
