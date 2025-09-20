"use server";

import { redirect } from "next/navigation";
import {
  SIGNUP_FIELDS,
  type SignupFormFieldNames,
  type SignupFormInput,
  SignupFormSchema,
} from "@/features/auth/domain/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { USER_ERROR_MESSAGES } from "@/features/users/messages";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validation";
import { serverLogger } from "@/server/logging/serverLogger";
import { createUserDal } from "@/server/users/dal/create";
import { toUserId } from "@/shared/domain/id-converters";
import { toFormState } from "@/shared/forms/adapters";
import { toDenseFormErrors } from "@/shared/forms/errors";
import type { FormState } from "@/shared/forms/types";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Server action to handle signup form submission.
 * Uses `validateFormGeneric` to validate the form data.
 * Uses `toFormState` to convert the result to a form state.
 */
export async function signup(
  _prevState: FormState<SignupFormFieldNames>,
  formData: FormData,
): Promise<FormState<SignupFormFieldNames>> {
  // Prepare fields and raw values for adapter (values will be redacted inside adapter)
  const fields = SIGNUP_FIELDS;
  const raw = Object.fromEntries(formData.entries());
  const emptyDense = toDenseFormErrors<SignupFormFieldNames>({}, fields);

  const result = await validateFormGeneric<
    SignupFormFieldNames,
    SignupFormInput
  >(formData, SignupFormSchema, fields, {
    // Normalize email; Normalize username; password redaction is handled by adapter defaults
    transform: (d: SignupFormInput) => ({
      ...d,
      email: d.email.toLowerCase().trim(),
      username: d.username.trim(),
    }),
  });

  const validated = toFormState(result, { fields, raw });

  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  const { username, email, password } = validated.data;

  try {
    const db = getDB();
    const user = await createUserDal(db, {
      email,
      password,
      role: toUserRole("USER"),
      username,
    });

    if (!user) {
      return toFormState(
        { error: emptyDense, success: false },
        { failureMessage: USER_ERROR_MESSAGES.CREATE_FAILED, fields, raw },
      );
    }
    await setSessionToken(toUserId(user.id), toUserRole("USER"));
  } catch (error) {
    serverLogger.error({
      context: "signup",
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
