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
import { getAppDb } from "@/server/db/db.connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { createUserDal } from "@/server/users/dal/create";
import {
  selectSparseFieldErrorsForAllowedFields,
  toDenseFieldErrorMapFromSparse,
} from "@/shared/forms/errors/dense-error-map";
import { deriveFieldNamesFromSchema } from "@/shared/forms/fields/field-names.resolve";
import type { FormResult } from "@/shared/forms/types/form-result.type";

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
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <52 of 50>
export async function createUserAction(
  _prevState: FormResult<CreateUserFormFieldNames, unknown>,
  formData: FormData,
): Promise<FormResult<CreateUserFormFieldNames, unknown>> {
  const db = getAppDb();
  const allowed = deriveFieldNamesFromSchema(CreateUserFormSchema);

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
        error: {
          fieldErrors: toDenseFieldErrorMapFromSparse(
            selectSparseFieldErrorsForAllowedFields(
              parsed.error.flatten().fieldErrors,
              allowed,
            ),
            allowed,
          ),
          kind: "validation",
          message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
        },
        ok: false,
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
        error: {
          fieldErrors: toDenseFieldErrorMapFromSparse({}, allowed),
          kind: "validation",
          message: USER_ERROR_MESSAGES.CREATE_FAILED,
        },
        ok: false,
      };
    }

    return {
      ok: true,
      value: {
        data: user,
        message: USER_SUCCESS_MESSAGES.CREATE_SUCCESS,
      },
    };
  } catch (error) {
    serverLogger.error({
      context: "createUserAction",
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });
    return {
      error: {
        fieldErrors: toDenseFieldErrorMapFromSparse({}, allowed),
        kind: "validation",
        message: USER_ERROR_MESSAGES.UNEXPECTED,
      },
      ok: false,
    };
  }
}
