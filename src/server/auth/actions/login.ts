"use server";

import { redirect } from "next/navigation";
import type {
  LoginFormFieldNames,
  LoginFormFields,
} from "@/features/auth/types";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { toFormState } from "@/server/forms/adapters";
import { validateFormGeneric } from "@/server/forms/validation";
import { serverLogger } from "@/server/logging/serverLogger";
import { findUserForLogin } from "@/server/users/dal/find-user-for-login";
import { toUserId } from "@/shared/brands/mappers";
import type { FormState } from "@/shared/forms/types";
import { USER_ERROR_MESSAGES } from "@/shared/users/messages";
import {
  LoginAllowedFields,
  LoginFormSchema,
} from "@/shared/users/schema.shared";

export async function login(
  _prevState: FormState<LoginFormFieldNames>,
  formData: FormData,
): Promise<FormState<LoginFormFieldNames>> {
  "use server";

  // Prepare fields and raw values for adapter (values will be redacted inside adapter)
  const fields = LoginAllowedFields as readonly LoginFormFieldNames[];
  const raw = Object.fromEntries(formData.entries());

  const result = await validateFormGeneric<
    LoginFormFieldNames,
    LoginFormFields
  >(formData, LoginFormSchema, fields, {
    // Normalize email; password redaction is handled by adapter defaults
    transform: (d: LoginFormFields) => ({
      ...d,
      email: d.email.toLowerCase().trim(),
    }),
  });

  const validated = toFormState(result, {
    fields,
    raw,
    // Optional: override messages if desired
    // successMessage: AUTH_SUCCESS_MESSAGES.SIGNED_IN,
    // failureMessage: AUTH_ERROR_MESSAGES.VALIDATION_FAILED,
  });

  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  const { email, password } = validated.data;
  const db = getDB();

  try {
    const user = await findUserForLogin(db, email, password);

    if (!user) {
      return {
        errors: {},
        message: USER_ERROR_MESSAGES.INVALID_CREDENTIALS,
        success: false,
      };
    }

    await setSessionToken(toUserId(user.id), toUserRole(user.role));
  } catch (error) {
    serverLogger.error({
      context: "login",
      email: formData.get("email") as string,
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });

    return {
      errors: {},
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    };
  }

  redirect("/dashboard");
}
