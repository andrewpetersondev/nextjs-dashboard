"use server";
import { redirect } from "next/navigation";
import { makeAuthComposition } from "@/modules/auth/infrastructure/composition/auth.composition";
import type { DenseFieldErrorMap } from "@/shared/forms/core/types/field-error.types";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";
import { ROUTES } from "@/shared/routes/routes";
import { PerformanceTracker } from "@/shared/telemetry/observability/performance-tracker";
import {
  ADMIN_ROLE,
  USER_ROLE,
  type UserRole,
} from "@/shared/validation/user-role/user-role.constants";

/**
 * Internal helper: creates a demo user for the given role.
 *
 * @remarks
 * This function orchestrates the demo user creation workflow, including
 * database transaction management, performance tracking, and logging.
 *
 * @param role - The {@link UserRole} of the demo user to create.
 * @returns A promise resolving to a {@link FormResult} containing error details if the process fails.
 * @redirects {ROUTES.dashboard.root} on success.
 * @internal
 */
async function createDemoUserInternal(
  role: UserRole,
): Promise<FormResult<never>> {
  const auth = await makeAuthComposition();
  const { ip } = auth.request;
  const tracker = new PerformanceTracker();

  const logger = auth.loggers.action.child({ role });

  logger.operation("info", "Demo user action started", {
    operationContext: "authentication",
    operationIdentifiers: { ip, role },
    operationName: "demoUser.start",
  });

  const sessionResult = await tracker.measure("authentication", () =>
    auth.workflows.demoUser({ role }),
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
 * Next.js Server Action for creating a demo user with the 'USER' role.
 *
 * @param _prevState - The previous form state (unused but required by `useActionState`).
 * @param _formData - The form data (unused).
 * @returns A promise resolving to a {@link FormResult} containing error details if the process fails.
 * @redirects {ROUTES.dashboard.root} on success.
 */
export async function demoUserAction(
  _prevState: FormResult<never>,
  _formData: FormData,
): Promise<FormResult<never>> {
  return await createDemoUserInternal(USER_ROLE);
}

/**
 * Next.js Server Action for creating a demo user with the 'ADMIN' role.
 *
 * @param _prevState - The previous form state (unused but required by `useActionState`).
 * @param _formData - The form data (unused).
 * @returns A promise resolving to a {@link FormResult} containing error details if the process fails.
 * @redirects {ROUTES.dashboard.root} on success.
 */
export async function demoAdminAction(
  _prevState: FormResult<never>,
  _formData: FormData,
): Promise<FormResult<never>> {
  return await createDemoUserInternal(ADMIN_ROLE);
}
