"use server";

import { redirect } from "next/navigation";
import {
  LOGIN_FIELDS,
  type LoginFormFieldNames,
  type LoginFormInput,
  LoginFormSchema,
} from "@/features/auth/lib/auth.schema";
import { USER_ERROR_MESSAGES } from "@/features/users/lib/messages";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { findUserForLogin } from "@/server/users/dal/find-user-for-login";
import { toUserId } from "@/shared/domain/id-converters";
import { toDenseFormErrors } from "@/shared/forms/error-mapping";
import type { FormState } from "@/shared/forms/form-types";
import { toFormState } from "@/shared/forms/result-to-form-state";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Server Action: login
 *
 * Validates login input, authenticates the user, starts a session, and redirects.
 *
 * Flow:
 * 1) Validate and normalize form data with `validateFormGeneric`.
 * 2) Convert validation result to `FormState` for UI consumption.
 * 3) On success, verify credentials via DAL and set a session.
 * 4) Redirect to the dashboard or return a failure state.
 *
 * @param _prevState - Previous form state (ignored by this action)
 * @param formData - FormData containing login fields
 * @returns FormState for UI; on success this action redirects
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export async function login(
  _prevState: FormState<LoginFormFieldNames>,
  formData: FormData,
): Promise<FormState<LoginFormFieldNames>> {
  // Capture field meta and raw values for consistent error mapping and UX.
  const fields = LOGIN_FIELDS;
  const raw = Object.fromEntries(formData.entries());
  const emptyDense = toDenseFormErrors<LoginFormFieldNames>({}, fields);

  // Validate and normalize inputs (email is lowercased/trimmed).
  const result = await validateFormGeneric<LoginFormFieldNames, LoginFormInput>(
    formData,
    LoginFormSchema,
    fields,
    {
      transform: (d: LoginFormInput) => ({
        ...d,
        email: d.email.toLowerCase().trim(),
      }),
    },
  );

  // Convert to a serializable form state for UI consumption.
  const validated = toFormState(result, { fields, raw });

  // Early return if validation failed; UI will render field errors and messages.
  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  const { email, password } = validated.data;

  try {
    // Authenticate via DAL; returns a safe DTO or null.
    const db = getDB();
    const user = await findUserForLogin(db, email, password);

    if (!user) {
      // Invalid credentials: return failure state without leaking specifics.
      return toFormState(
        { error: emptyDense, success: false },
        {
          failureMessage: USER_ERROR_MESSAGES.INVALID_CREDENTIALS,
          fields,
          raw,
        },
      );
    }

    // Establish session using branded identifiers and role mapping.
    await setSessionToken(toUserId(user.id), toUserRole(user.role));
  } catch (error) {
    // Log with context; return generic failure to avoid exposing internals.
    serverLogger.error({
      context: "login",
      email: formData.get("email") as string,
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });

    return toFormState(
      { error: emptyDense, success: false },
      { failureMessage: USER_ERROR_MESSAGES.UNEXPECTED, fields, raw },
    );
  }

  // On success, redirect to a post-login landing page.
  redirect(ROUTES.DASHBOARD.ROOT);
}
