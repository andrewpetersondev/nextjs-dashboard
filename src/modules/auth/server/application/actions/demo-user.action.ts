"use server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/modules/auth/domain/auth.roles";
import { AuthLog, logAuth } from "@/modules/auth/domain/logging/auth-log";
import { executeAuthPipeline } from "@/modules/auth/server/application/actions/auth-pipeline.helper";
import { createAuthUserService } from "@/modules/auth/server/application/services/factories/auth-user-service.factory";
import { getAppDb } from "@/server-core/db/db.connection";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { formError } from "@/shared/forms/utilities/factories/create-form-result.factory";
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
  const requestId = crypto.randomUUID();

  logAuth(
    "info",
    "Demo user creation started",
    AuthLog.action.demoUser.start(),
    {
      additionalData: { role },
      requestId,
    },
  );

  const service = createAuthUserService(getAppDb());

  const sessionResult = await executeAuthPipeline(
    role,
    service.createDemoUser.bind(service),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logAuth(
      "error",
      "Demo user creation failed",
      AuthLog.action.demoUser.error(error, { role }),
      {
        requestId,
      },
    );

    return formError({
      fieldErrors: {} as Record<string, readonly string[]>,
      message: error.message || DEMO_USER_ERROR_MESSAGE,
    });
  }

  logAuth(
    "info",
    "Demo user created successfully",
    AuthLog.action.demoUser.success({ role }),
    {
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
      message: DEMO_USER_ERROR_MESSAGE,
    });
  }

  return await createDemoUserInternal(role);
}
