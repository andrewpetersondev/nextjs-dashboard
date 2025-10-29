"use server";
import { redirect } from "next/navigation";
import { GUEST_ROLE, type UserRole } from "@/features/auth/lib/auth.roles";
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { formError } from "@/shared/forms/domain/factories/form-result.factory";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
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
  const service = createAuthUserService(getAppDb());

  const sessionResult = await executeAuthPipeline(
    role,
    service.createDemoUser.bind(service),
  );

  if (!sessionResult.ok) {
    return formError({
      fieldErrors: {} as Record<string, readonly string[]>,
      message: sessionResult.error.message || DEMO_USER_ERROR_MESSAGE,
    });
  }

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

/**
 * Handles the demo user action by creating a demo user,
 * establishing a session, and redirecting on success.
 *
 * Flow:
 * - Create demo user → map Ok(user) to { id, role } only.
 * - Establish session → on failure, map to UI-safe FormResult.
 * - Redirect to dashboard on success.
 *
 * @returns FormResult on auth/session errors, redirects on success
 */
export async function demoUserAction(
  role: UserRole = GUEST_ROLE,
): Promise<FormResult<never>> {
  const service = createAuthUserService(getAppDb());

  const sessionResult = await executeAuthPipeline(
    role,
    service.createDemoUser.bind(service),
  );

  if (!sessionResult.ok) {
    // Service returns form-aware errors; convert to FormResult without field-specific errors
    return formError({
      fieldErrors: {} as Record<string, readonly string[]>,
      message: sessionResult.error.message || DEMO_USER_ERROR_MESSAGE,
    });
  }

  redirect(ROUTES.dashboard.root);
}
