"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { makeAuthComposition } from "@/modules/auth/infrastructure/composition/auth.composition";
import { toLoginCommand } from "@/modules/auth/presentation/authn/adapters/to-login-command.adapter";
import { toLoginFormResult } from "@/modules/auth/presentation/authn/mappers/to-login-form-result.mapper";
import {
  LOGIN_FIELDS_LIST,
  LoginFormSchema,
  type LoginRequestDto,
} from "@/modules/auth/presentation/authn/transports/login.form.schema";
import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { extractFieldErrors } from "@/shared/forms/logic/inspectors/form-error.inspector";
import { validateForm } from "@/shared/forms/server/validate-form";
import { ROUTES } from "@/shared/routes/routes";
import { PerformanceTracker } from "@/shared/telemetry/observability/performance-tracker";

/**
 * Next.js Server Action for user authentication (login).
 *
 * @remarks
 * This action orchestrates the entire login process:
 * 1. Validates the {@link FormData} against {@link LoginFormSchema}.
 * 2. Executes the {@link loginWorkflow} which handles authentication and session establishment.
 * 3. Tracks performance and logs the outcome (success or failure).
 * 4. Maps domain/application errors to UI-compatible {@link FormResult}.
 * 5. Revalidates the dashboard path and redirects on success.
 *
 * It is intended to be used with the `useActionState` hook in the login form component.
 *
 * @param _prevState - The previous form state (unused but required by `useActionState`).
 * @param formData - The form data containing login credentials (email, password).
 * @returns A promise resolving to a {@link FormResult} containing error details if the process fails.
 * @redirects {ROUTES.dashboard.root} on success.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Server Action boundary requires validation, orchestration, logging, and result mapping
export async function loginAction(
  _prevState: FormResult<unknown>,
  formData: FormData,
): Promise<FormResult<never>> {
  const auth = await makeAuthComposition();
  const { ip } = auth.request;

  const tracker = new PerformanceTracker();

  const logger = auth.loggers.action;

  logger.operation("info", "Login action started", {
    operationContext: "authentication",
    operationIdentifiers: { ip },
    operationName: "login.start",
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, LoginFormSchema, LOGIN_FIELDS_LIST),
  );

  if (!validated.ok) {
    const fieldErrors = extractFieldErrors<LoginField>(validated.error) || {};
    const errorCount = Object.keys(fieldErrors).length;

    logger.operation("warn", "Login validation failed", {
      duration: tracker.getTotalDuration(),
      errorCount,
      operationContext: "validation",
      operationIdentifiers: { ip },
      operationName: "login.validation.failed",
    });

    return validated;
  }

  const input: LoginRequestDto = validated.value.data;

  logger.operation("info", "Login form validated", {
    duration: tracker.getLastDuration("validation"),
    operationContext: "validation",
    operationIdentifiers: { email: input.email, ip },
    operationName: "login.validation.success",
  });

  const sessionResult = await tracker.measure("authentication", () =>
    auth.workflows.login(toLoginCommand(input)),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logger.errorWithDetails("Login authentication failed", error, {
      duration: tracker.getTotalDuration(),
      operationContext: "authentication",
      operationIdentifiers: { email: input.email, ip },
      operationName: "login.authentication.failed",
    });

    return toLoginFormResult(error, input);
  }

  const { id: userId, role } = sessionResult.value;

  logger.operation("info", "Login action completed successfully", {
    duration: tracker.getTotalDuration(),
    operationContext: "authentication",
    operationIdentifiers: { email: input.email, ip, role, userId },
    operationName: "login.success",
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
