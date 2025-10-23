"use server";
import { redirect } from "next/navigation";
import { GUEST_ROLE, type UserRole } from "@/features/auth/lib/auth.roles";
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import type { FormResult } from "@/shared/forms/core/types";
import { appErrorToFormResult } from "@/shared/forms/errors/app-error.adapter";
import { ROUTES } from "@/shared/routes/routes";

const DEMO_USER_ERROR_MESSAGE = "Failed to create demo user. Please try again.";

/**
 * Handles the demo user action by creating a demo user,
 * establishing a session, and redirecting on success.
 *
 * Flow:
 * - Create demo user → map Ok(user) to { id, role } only.
 * - Establish session → on failure, map to UI-safe FormResult.
 * - Redirect to dashboard on success.
 */
export async function demoUserAction(
  role: UserRole = GUEST_ROLE,
): Promise<FormResult<never, Record<string, never>>> {
  const service = createAuthUserService(getAppDb());

  const sessionResult = await executeAuthPipeline(
    role,
    service.createDemoUser.bind(service),
  );

  if (!sessionResult.ok) {
    return appErrorToFormResult({
      defaultMessage: DEMO_USER_ERROR_MESSAGE,
      error: sessionResult.error,
      fields: [],
      raw: {},
    });
  }

  redirect(ROUTES.DASHBOARD.ROOT);
}
