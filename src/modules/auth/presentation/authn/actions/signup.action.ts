"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { makeAuthComposition } from "@/modules/auth/infrastructure/composition/auth.composition";
import { toSignupCommand } from "@/modules/auth/presentation/authn/adapters/to-signup-command.adapter";
import { toSignupFormResult } from "@/modules/auth/presentation/authn/mappers/to-signup-form-result.mapper";
import {
  SIGNUP_FIELDS_LIST,
  SignupFormSchema,
  type SignupRequestDto,
} from "@/modules/auth/presentation/authn/transports/signup.form.schema";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { extractFieldErrors } from "@/shared/forms/logic/inspectors/form-error.inspector";
import { validateForm } from "@/shared/forms/server/validate-form.logic";
import { PerformanceTracker } from "@/shared/observability/performance-tracker";
import { ROUTES } from "@/shared/routes/routes";

const fields = SIGNUP_FIELDS_LIST;

/**
 * Next.js Server Action for user registration (signup).
 *
 * @remarks
 * This action orchestrates the entire signup flow:
 * 1. Validates the {@link FormData} against {@link SignupFormSchema}.
 * 2. Executes the auth composition's signup workflow which handles user creation
 *    within a transaction and session establishment.
 * 3. Tracks performance and logs the outcome (success or failure).
 * 4. Maps domain/application errors to UI-compatible {@link FormResult}.
 * 5. Revalidates the dashboard path and redirects on success.
 *
 * It is intended to be used with the `useActionState` hook in the signup form component.
 *
 * @param _prevState - The previous form state (unused but required by `useActionState`).
 * @param formData - The form data containing registration details (email, password, username).
 * @returns A promise resolving to a {@link FormResult} containing error details if the process fails.
 * @redirects {ROUTES.dashboard.root} on success.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: signup flow is inherently multi-step
export async function signupAction(
  _prevState: FormResult<unknown>,
  formData: FormData,
): Promise<FormResult<never>> {
  const auth = await makeAuthComposition();
  const { ip } = auth.request;
  const tracker = new PerformanceTracker();

  const logger = auth.loggers.action;

  logger.operation("info", "Signup action started", {
    operationContext: "authentication",
    operationIdentifiers: { ip },
    operationName: "signup.start",
  });

  const validated = await tracker.measure("validation", () =>
    validateForm(formData, SignupFormSchema, fields),
  );

  if (!validated.ok) {
    const fieldErrors = extractFieldErrors<SignupField>(validated.error) || {};
    const errorCount = Object.keys(fieldErrors).length;

    logger.operation("warn", "Signup validation failed", {
      duration: tracker.getTotalDuration(),
      errorCount,
      operationContext: "validation",
      operationIdentifiers: { ip },
      operationName: "signup.validation.failed",
    });

    return validated;
  }

  const input = validated.value.data satisfies SignupRequestDto;

  logger.operation("info", "Signup form validated", {
    duration: tracker.getLastDuration("validation"),
    operationContext: "validation",
    operationIdentifiers: { email: input.email, ip },

    operationName: "signup.validation.success",
  });

  const sessionResult = await tracker.measure("authentication", () =>
    auth.workflows.signup(toSignupCommand(input)),
  );

  if (!sessionResult.ok) {
    const error = sessionResult.error;

    logger.errorWithDetails("Signup authentication failed", error, {
      duration: tracker.getTotalDuration(),
      operationContext: "authentication",
      operationIdentifiers: {
        email: input.email,
        ip,
        username: input.username,
      },
      operationName: "signup.authentication.failed",
    });

    return toSignupFormResult(error, input);
  }

  const { id: userId, role } = sessionResult.value;

  logger.operation("info", "Signup action completed successfully", {
    duration: tracker.getTotalDuration(),
    operationContext: "authentication",
    operationIdentifiers: { email: input.email, ip, role, userId },
    operationName: "signup.success",
  });

  revalidatePath(ROUTES.dashboard.root);
  redirect(ROUTES.dashboard.root);
}
