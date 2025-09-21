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
 * Server action to handle login form submission.
 * Uses `validateFormGeneric` to validate the form data.
 * Uses `toFormState` to convert the result to a form state.
 */
export async function login(
  _prevState: FormState<LoginFormFieldNames>,
  formData: FormData,
): Promise<FormState<LoginFormFieldNames>> {
  // Prepare fields and raw values for adapter (values will be redacted inside adapter)
  const fields = LOGIN_FIELDS;
  const raw = Object.fromEntries(formData.entries());
  const emptyDense = toDenseFormErrors<LoginFormFieldNames>({}, fields);

  const result = await validateFormGeneric<LoginFormFieldNames, LoginFormInput>(
    formData,
    LoginFormSchema,
    fields,
    {
      // Normalize email; password redaction is handled by adapter defaults
      transform: (d: LoginFormInput) => ({
        ...d,
        email: d.email.toLowerCase().trim(),
      }),
    },
  );

  const validated = toFormState(result, { fields, raw });

  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  const { email, password } = validated.data;

  try {
    const db = getDB();
    const user = await findUserForLogin(db, email, password);

    if (!user) {
      return toFormState(
        { error: emptyDense, success: false },
        {
          failureMessage: USER_ERROR_MESSAGES.INVALID_CREDENTIALS,
          fields,
          raw,
        },
      );
    }

    await setSessionToken(toUserId(user.id), toUserRole(user.role));
  } catch (error) {
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

  redirect(ROUTES.DASHBOARD.ROOT);
}
