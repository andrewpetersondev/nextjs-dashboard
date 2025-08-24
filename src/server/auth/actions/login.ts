import { redirect } from "next/navigation";
import type { LoginFormFieldNames } from "@/features/auth/types";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { USER_ERROR_MESSAGES } from "@/features/users/messages";
import { LoginFormSchema } from "@/features/users/schema.client";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { logger } from "@/server/logging/logger";
import { findUserForLogin } from "@/server/users/dal";
import { toUserId } from "@/shared/brands/domain-brands";
import type { FormState } from "@/shared/forms/types";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <temporary>
export async function login(
  _prevState: FormState<LoginFormFieldNames>,
  formData: FormData,
): Promise<FormState<LoginFormFieldNames>> {
  "use server";
  // keep: I want to see if this is the cause of the error for login page not rendering
  // const validated = (await validateFormGeneric<
  //   LoginFormFieldNames,
  //   LoginFormFields
  // >(formData, LoginFormSchema, undefined, {
  //   returnMode: "form",
  //   // biome-ignore lint/nursery/useExplicitType: <temporary>
  //   transform: (d) => ({
  //     ...d,
  //     email: d.email.toLowerCase().trim(),
  //   }),
  // })) as FormState<LoginFormFieldNames, LoginFormFields>;
  //
  // if (!validated.success || typeof validated.data === "undefined") {
  //   return validated;
  // }

  const input = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const validated = LoginFormSchema.safeParse(input);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
      success: false,
    };
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
