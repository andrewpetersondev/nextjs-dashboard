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
import { sparseToDense } from "@/shared/forms/error-mapping";
import type { FormState } from "@/shared/forms/form-types";
import { resultToFormState } from "@/shared/forms/result-to-form-state";
import { ROUTES } from "@/shared/routes/routes";

// Small helpers to keep main flow concise
const fields = LOGIN_FIELDS;

function emptyErrors(): ReturnType<typeof sparseToDense<LoginFormFieldNames>> {
  return sparseToDense<LoginFormFieldNames>({}, fields);
}

function invalidCredentialsState(
  raw: Record<string, FormDataEntryValue>,
): FormState<LoginFormFieldNames> {
  return resultToFormState(
    { error: emptyErrors(), success: false },
    {
      failureMessage: USER_ERROR_MESSAGES.INVALID_CREDENTIALS,
      fields,
      raw,
    },
  );
}

function unexpectedErrorState(
  raw: Record<string, FormDataEntryValue>,
): FormState<LoginFormFieldNames> {
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
 * Server Action: login
 *
 * Validates login input, authenticates the user, starts a session, and redirects.
 *
 * @param _prevState - Previous form state (ignored by this action)
 * @param formData - FormData containing login fields
 * @returns FormState for UI; on success this action redirects
 */
export async function login(
  _prevState: FormState<LoginFormFieldNames>,
  formData: FormData,
): Promise<FormState<LoginFormFieldNames>> {
  const raw = Object.fromEntries(formData.entries());

  // 1) Validate + normalize (email lowercased/trimmed)
  const validated = await validateFormGeneric<
    LoginFormInput,
    LoginFormFieldNames
  >(formData, LoginFormSchema, fields, {
    fields,
    loggerContext: "login.validate",
    raw,
    transform: (d: LoginFormInput) => ({
      ...d,
      email: d.email.toLowerCase().trim(),
    }),
  });

  if (!validated.success || !validated.data) {
    return validated;
  }

  const { email, password } = validated.data;

  try {
    // 2) Authenticate
    const db = getDB();
    const user = await findUserForLogin(db, email, password);
    if (!user) {
      return invalidCredentialsState(raw);
    }

    // 3) Establish session
    await setSessionToken(toUserId(user.id), toUserRole(user.role));
  } catch (err) {
    // Narrow error and avoid leaking sensitive data
    const error =
      err instanceof Error
        ? { message: err.message, name: err.name }
        : { message: "Unknown error" };
    serverLogger.error({
      context: "login",
      email, // already normalized, avoids reading from raw form
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });
    return unexpectedErrorState(raw);
  }

  // 4) Redirect on success
  redirect(ROUTES.DASHBOARD.ROOT);
}
