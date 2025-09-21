"use server";

import { redirect } from "next/navigation";
import { USER_ROLE } from "@/features/auth/lib/auth.roles";
import {
  SIGNUP_FIELDS,
  type SignupFormFieldNames,
  type SignupFormInput,
  SignupFormSchema,
} from "@/features/auth/lib/auth.schema";
import { USER_ERROR_MESSAGES } from "@/features/users/lib/messages";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { createUserDal } from "@/server/users/dal/create";
import { toUserId } from "@/shared/domain/id-converters";
import { toDenseFormErrors } from "@/shared/forms/error-mapping";
import type { FormState } from "@/shared/forms/form-types";
import { resultToFormState } from "@/shared/forms/result-to-form-state";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Server Action: signup
 *
 * Validates signup input, creates a new user, initializes a session, and redirects.
 *
 * Flow:
 * 1) Validate and normalize form data with `validateFormGeneric`.
 * 2) Convert validation result to `FormState` for UI.
 * 3) On success, create user via DAL and set session.
 * 4) Redirect to the dashboard or return a failure state.
 *
 * @param _prevState - Previous form state (ignored by this action)
 * @param formData - FormData containing signup fields
 * @returns FormState for UI; on success this action redirects
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function signup(
  _prevState: FormState<SignupFormFieldNames>,
  formData: FormData,
): Promise<FormState<SignupFormFieldNames>> {
  // Capture field meta and raw values for consistent error mapping and UX.
  const fields = SIGNUP_FIELDS;
  const raw = Object.fromEntries(formData.entries());
  const emptyDense = toDenseFormErrors<SignupFormFieldNames>({}, fields);

  // Validate and normalize inputs (email lowercased/trimmed, username trimmed).
  const result = await validateFormGeneric<
    SignupFormFieldNames,
    SignupFormInput
  >(formData, SignupFormSchema, fields, {
    transform: (d: SignupFormInput) => ({
      ...d,
      email: d.email.toLowerCase().trim(),
      username: d.username.trim(),
    }),
  });

  // Convert to a serializable form state for UI consumption.
  const validated = resultToFormState(result, { fields, raw });

  // Early return on validation failure; UI will render field errors/messages.
  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  const { username, email, password } = validated.data;

  try {
    // Create user through DAL with default role mapping.
    const db = getDB();
    const user = await createUserDal(db, {
      email,
      password,
      role: toUserRole(USER_ROLE),
      username,
    });

    if (!user) {
      // Creation failed (e.g., constraint violation handled upstream): return failure state.
      return resultToFormState(
        { error: emptyDense, success: false },
        { failureMessage: USER_ERROR_MESSAGES.CREATE_FAILED, fields, raw },
      );
    }

    // Establish session for the newly created user.
    await setSessionToken(toUserId(user.id), toUserRole(USER_ROLE));
  } catch (error) {
    // Log with context; return generic failure without leaking details.
    serverLogger.error({
      context: "signup",
      email: formData.get("email") as string,
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });

    return resultToFormState(
      { error: emptyDense, success: false },
      { failureMessage: USER_ERROR_MESSAGES.UNEXPECTED, fields, raw },
    );
  }

  // On success, redirect to the post-signup landing page.
  redirect(ROUTES.DASHBOARD.ROOT);
}
