"use server";
import { redirect } from "next/navigation";
import { GUEST_ROLE, type UserRole } from "@/features/auth/lib/auth.roles";
import { handleAuthError } from "@/server/auth/application/actions/auth-error-handler";
import { executeAuthPipeline } from "@/server/auth/application/actions/auth-pipeline.helper";
import { createAuthUserService } from "@/server/auth/application/services/factories/auth-user-service.factory";
import { AUTH_ACTION_CONTEXTS } from "@/server/auth/domain/constants/auth.constants";
import { getAppDb } from "@/server/db/db.connection";
import type { FormResult } from "@/shared/forms/core/types";
import { toFormOk } from "@/shared/forms/state/mappers/result-to-form.mapper";
import { ROUTES } from "@/shared/routes/routes";

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
): Promise<FormResult<never, unknown>> {
  const service = createAuthUserService(getAppDb());

  const sessionResult = await executeAuthPipeline(
    role,
    service.createDemoUser.bind(service),
  );

  if (!sessionResult.ok) {
    return handleAuthError(
      sessionResult.error,
      [],
      {},
      AUTH_ACTION_CONTEXTS.DEMO_USER,
    );
  }

  redirect(ROUTES.DASHBOARD.ROOT);
  return toFormOk<never, unknown>({});
}
