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

// Small helpers to keep main flow concise
const fields = SIGNUP_FIELDS;

function emptyErrors(): ReturnType<
  typeof toDenseFormErrors<SignupFormFieldNames>
> {
  return toDenseFormErrors<SignupFormFieldNames>({}, fields);
}

function creationFailedState(
  raw: Record<string, FormDataEntryValue>,
): FormState<SignupFormFieldNames> {
  return resultToFormState(
    { error: emptyErrors(), success: false },
    {
      failureMessage: USER_ERROR_MESSAGES.CREATE_FAILED,
      fields,
      raw,
    },
  );
}

function unexpectedErrorState(
  raw: Record<string, FormDataEntryValue>,
): FormState<SignupFormFieldNames> {
  return resultToFormState(
    { error: emptyErrors(), success: false },
    {
      failureMessage: USER_ERROR_MESSAGES.UNEXPECTED,
      fields,
      raw,
    },
  );
}

/**
 * Server Action: signup
 *
 * Validates signup input, creates a new user, initializes a session, and redirects.
 *
 * @param _prevState - Previous form state (ignored by this action)
 * @param formData - FormData containing signup fields
 * @returns FormState for UI; on success this action redirects
 */
export async function signup(
  _prevState: FormState<SignupFormFieldNames>,
  formData: FormData,
): Promise<FormState<SignupFormFieldNames>> {
  const raw = Object.fromEntries(formData.entries());

  // 1) Validate + normalize (email lowercased/trimmed, username trimmed)
  const validated = await validateFormGeneric<
    SignupFormInput,
    SignupFormFieldNames
  >(formData, SignupFormSchema, fields, {
    fields,
    loggerContext: "signup.validate",
    raw,
    transform: (d: SignupFormInput) => ({
      ...d,
      email: d.email.toLowerCase().trim(),
      username: d.username.trim(),
    }),
  });

  if (!validated.success || !validated.data) {
    return validated;
  }

  const { username, email, password } = validated.data;

  try {
    // 2) Create user (default role)
    const db = getDB();
    const user = await createUserDal(db, {
      email,
      password,
      role: toUserRole(USER_ROLE),
      username,
    });

    if (!user) {
      return creationFailedState(raw);
    }

    // 3) Establish session
    await setSessionToken(toUserId(user.id), toUserRole(USER_ROLE));
  } catch (err) {
    const error =
      err instanceof Error
        ? { message: err.message, name: err.name }
        : { message: "Unknown error" };
    serverLogger.error({
      context: "signup",
      email, // normalized
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });
    return unexpectedErrorState(raw);
  }

  // 4) Redirect on success
  redirect(ROUTES.DASHBOARD.ROOT);
}
