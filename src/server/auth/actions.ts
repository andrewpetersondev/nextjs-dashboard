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
import { deleteSessionToken, setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validation";
import { logger } from "@/server/logging/logger";
import {
  createDemoUser,
  createUserDal,
  demoUserCounter,
} from "@/server/users/dal";
import type { UserDto } from "@/server/users/dto";
import {
  type ActionResult,
  actionResult,
} from "@/shared/action-result/action-result";
import type { AuthRole } from "@/shared/auth/roles";
import { toUserId } from "@/shared/brands/domain-brands";
import type { FormState } from "@/shared/forms/types";

/**
 * Handles user signup.
 */
export async function signup(
  _prevState: FormState<SignupFormFieldNames>,
  formData: FormData,
): Promise<FormState<SignupFormFieldNames>> {
  const validated = (await validateFormGeneric<
    SignupFormFieldNames,
    SignupFormFields
  >(formData, SignupFormSchema, SignupAllowedFields, {
    returnMode: "form",
    // Example: normalize email; redact password is default
    // biome-ignore lint/nursery/useExplicitType: <temporary>
    transform: (d) => ({
      ...d,
      email: d.email.toLowerCase().trim(),
      username: d.username.trim(),
    }),
  })) as FormState<SignupFormFieldNames, SignupFormFields>;

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

/**
 * Logs out the current user and redirects to home.
 */
export async function logout(): Promise<void> {
  await deleteSessionToken();
  redirect("/");
}

/**
 * Creates a demo user and logs them in.
 */
export async function demoUser(
  role: AuthRole = toUserRole("guest"),
): Promise<ActionResult> {
  let demoUser: UserDto | null = null;
  const db = getDB();
  try {
    const counter: number = await demoUserCounter(db, toUserRole(role));
    if (!counter) {
      logger.error({
        context: "demoUser",
        message: "Counter is zero or undefined",
        role,
      });

      throw new Error("Counter is zero or undefined");
    }
    demoUser = await createDemoUser(db, counter, toUserRole(role));
    if (!demoUser) {
      logger.error({
        context: "demoUser",
        message: "Demo user creation failed",
        role,
      });
      throw new Error("Demo user creation failed");
    }
    await setSessionToken(toUserId(demoUser.id), toUserRole(role));
  } catch (error) {
    logger.error({
      context: "demoUser",
      demoUser,
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      role,
    });
    return actionResult({
      errors: { _root: [USER_ERROR_MESSAGES.UNEXPECTED] },
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    });
  }
  redirect("/dashboard");
}
