"use server";
import { asPasswordHash } from "@/features/auth/lib/password.types";
import { getValidUserRole } from "@/features/users/lib/get-valid-user-role";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/features/users/lib/messages";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { CreateUserFormSchema } from "@/features/users/lib/user.schema";
import { getAppDb } from "@/server/db/db.connection";
import { createUserDal } from "@/server/users/dal/create";
import {
  createEmptyDenseFieldErrorMap,
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/domain/factories/error-map.factory";
import {
  formError,
  formOk,
} from "@/shared/forms/domain/factories/form-result.factory";
import type { FormResult } from "@/shared/forms/domain/models/form-result";
import { deriveFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod/field-names";
import { sharedLogger } from "@/shared/logging/logger.shared";

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
  _prevState: FormResult<unknown>,
  formData: FormData,
): Promise<FormResult<unknown>> {
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
      return formError({
        fieldErrors: toDenseFieldErrorMap(
          selectSparseFieldErrors(parsed.error.flatten().fieldErrors, allowed),
          allowed,
        ),
        message: USER_ERROR_MESSAGES.validationFailed,
      });
    }

    const { username, email, password, role } = parsed.data;
    const user = await createUserDal(db, {
      email,
      password: asPasswordHash(password),
      role: toUserRole(role),
      username,
    });

    if (!user) {
      sharedLogger.warn({
        context: "createUserAction",
        message: "User creation returned empty result",
        safeMeta: { email, username },
      });
      return formError({
        fieldErrors: createEmptyDenseFieldErrorMap(allowed),
        message: USER_ERROR_MESSAGES.createFailed,
      });
    }

    return formOk(user, USER_SUCCESS_MESSAGES.createSuccess);
  } catch (error) {
    sharedLogger.error({
      context: "createUserAction",
      error,
      message: USER_ERROR_MESSAGES.unexpected,
    });
    return formError({
      fieldErrors: toDenseFieldErrorMap({}, allowed),
      message: USER_ERROR_MESSAGES.unexpected,
    });
  }
}
