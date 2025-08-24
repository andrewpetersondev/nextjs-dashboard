"use server";

import { redirect } from "next/navigation";
import type {
  LoginFormFieldNames,
  LoginFormFields,
} from "@/features/auth/types";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { USER_ERROR_MESSAGES } from "@/features/users/messages";
import { LoginFormSchema } from "@/features/users/schema.client";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validation";
import { logger } from "@/server/logging/logger";
import { findUserForLogin } from "@/server/users/dal";
import { toUserId } from "@/shared/brands/domain-brands";
import type { FormState } from "@/shared/forms/types";

/**
 * Handles user login.
 */
export async function login(
  _prevState: FormState<LoginFormFieldNames>,
  formData: FormData,
): Promise<FormState<LoginFormFieldNames>> {
  const validated = (await validateFormGeneric<
    LoginFormFieldNames,
    LoginFormFields
  >(formData, LoginFormSchema, undefined, {
    returnMode: "form",
    // biome-ignore lint/nursery/useExplicitType: <temporary>
    transform: (d) => ({
      ...d,
      email: d.email.toLowerCase().trim(),
    }),
  })) as FormState<LoginFormFieldNames, LoginFormFields>;

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
    logger.error({
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
  // keep: why does redirect have to be here instead of after the session is created?
  redirect("/dashboard");
}
