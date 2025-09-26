"use server";

import { getValidUserRole } from "@/features/users/lib/get-valid-user-role";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/features/users/lib/messages";
import { toUserRole } from "@/features/users/lib/to-user-role";
import {
  type CreateUserFormFieldNames,
  CreateUserFormSchema,
} from "@/features/users/lib/user.schema";
import { getDB } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { createUserDal } from "@/server/users/dal/create";
import { sparseToDense, toSparseErrors } from "@/shared/forms/error-mapping";
import type { FormState } from "@/shared/forms/form-types";
import { deriveAllowedFieldsFromSchema } from "@/shared/forms/schema-fields";

type CreateUserFormData = {
  readonly email: string | undefined;
  readonly password: string | undefined;
  readonly role: string | undefined;
  readonly username: string | undefined;
};

const toOptionalString = (v: FormDataEntryValue | null): string | undefined =>
  typeof v === "string" ? v : undefined;

function pickCreateUserFormData(formData: FormData): CreateUserFormData {
  return {
    email: toOptionalString(formData.get("email")),
    password: toOptionalString(formData.get("password")),
    role: toOptionalString(formData.get("role")),
    username: toOptionalString(formData.get("username")),
  };
}

/**
 * Creates a new user (admin only).
 */
export async function createUserAction(
  _prevState: FormState<CreateUserFormFieldNames>,
  formData: FormData,
): Promise<FormState<CreateUserFormFieldNames>> {
  const db = getDB();
  const allowed = deriveAllowedFieldsFromSchema(CreateUserFormSchema);

  try {
    const raw = pickCreateUserFormData(formData);
    const parsed = CreateUserFormSchema.safeParse({
      email: raw.email,
      password: raw.password,
      role: getValidUserRole(raw.role),
      username: raw.username,
    });

    if (!parsed.success) {
      return {
        errors: sparseToDense(
          toSparseErrors(parsed.error.flatten().fieldErrors, allowed),
          allowed,
        ),
        message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }

    const { username, email, password, role } = parsed.data;
    const user = await createUserDal(db, {
      email,
      password,
      role: toUserRole(role),
      username,
    });

    if (!user) {
      serverLogger.warn({
        context: "createUserAction",
        message: "User creation returned empty result",
        safeMeta: { email, username },
      });
      return {
        errors: sparseToDense({}, allowed),
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
      errors: sparseToDense({}, allowed),
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    };
  }
}
