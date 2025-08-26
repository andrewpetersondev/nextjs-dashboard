"use server";

import { redirect } from "next/navigation";
import type {
  SignupFormFieldNames,
  SignupFormFields,
} from "@/features/auth/types";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { USER_ERROR_MESSAGES } from "@/features/users/messages";
import {
  SignupAllowedFields,
  SignupFormSchema,
} from "@/features/users/schema.client";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { toFormState } from "@/server/forms/adapters";
import { validateFormGeneric } from "@/server/forms/validation";
import { logger } from "@/server/logging/logger";
import { createUserDal } from "@/server/users/dal/create";
import { toUserId } from "@/shared/brands/domain-brands";
import type { FormState } from "@/shared/forms/types";

export async function signup(
  _prevState: FormState<SignupFormFieldNames>,
  formData: FormData,
): Promise<FormState<SignupFormFieldNames>> {
  "use server";

  // Prepare fields and raw values for adapter (values will be redacted inside adapter)
  const fields = SignupAllowedFields as readonly SignupFormFieldNames[];
  const raw = Object.fromEntries(formData.entries());

  const result = await validateFormGeneric<
    SignupFormFieldNames,
    SignupFormFields
  >(formData, SignupFormSchema, fields, {
    // Normalize email; Normalize username; password redaction is handled by adapter defaults
    transform: (d: SignupFormFields) => ({
      ...d,
      email: d.email.toLowerCase().trim(),
      username: d.username.trim(),
    }),
  });

  const validated = toFormState(result, {
    fields,
    raw,
    // Optional: override messages if desired
    // successMessage: AUTH_SUCCESS_MESSAGES.SIGNED_UP,
    // failureMessage: AUTH_ERROR_MESSAGES.SIGNUP_FAILED,
  });
  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  const { username, email, password } = validated.data;

  const db = getDB();

  try {
    const user = await createUserDal(db, {
      email,
      password,
      role: toUserRole("user"),
      username,
    });

    if (!user) {
      return {
        errors: {},
        message: USER_ERROR_MESSAGES.CREATE_FAILED,
        success: false,
      };
    }
    await setSessionToken(toUserId(user.id), toUserRole("user"));
  } catch (error) {
    logger.error({
      context: "signup",
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
