"use server";

import { toUserRole } from "@/features/users/lib/to-user-role";
import { getDB } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { createUserDal } from "@/server/users/dal/create";
import { getValidUserRole } from "@/server/users/utils";
import type { FormState } from "@/shared/forms/types";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/shared/users/messages";
import {
  type CreateUserFormFieldNames,
  CreateUserFormSchema,
} from "@/shared/users/schema.shared";
import {
  deriveAllowedFieldsFromSchema,
  mapFieldErrors,
} from "@/shared/utils/utils";

/**
 * Creates a new user (admin only).
 */
export async function createUserAction(
  _prevState: FormState<CreateUserFormFieldNames>,
  formData: FormData,
): Promise<FormState<CreateUserFormFieldNames>> {
  const db = getDB();
  try {
    const validated = CreateUserFormSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      role: getValidUserRole(formData.get("role")),
      username: formData.get("username"),
    });
    if (!validated.success) {
      const allowed = deriveAllowedFieldsFromSchema(CreateUserFormSchema);
      return {
        errors: mapFieldErrors(validated.error.flatten().fieldErrors, allowed),
        message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }
    const { username, email, password, role } = validated.data;
    const user = await createUserDal(db, {
      email,
      password,
      role: toUserRole(role),
      username,
    });
    if (!user) {
      return {
        errors: {}, // todo: the error message should be more specific
        message: USER_ERROR_MESSAGES.CREATE_FAILED,
        success: false,
      };
    }
    return {
      data: user,
      message: USER_SUCCESS_MESSAGES.CREATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    serverLogger.error({
      context: "createUserAction",
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });

    return {
      errors: {},
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    };
  }
}
