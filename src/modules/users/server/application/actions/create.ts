"use server";
import { asPasswordHash } from "@/modules/auth/domain/password.types";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/modules/users/domain/user.messages";
import { getValidUserRole } from "@/modules/users/lib/get-valid-user-role";
import { toUserRole } from "@/modules/users/lib/to-user-role";
import { CreateUserFormSchema } from "@/modules/users/lib/user.schema";
import { createUserDal } from "@/modules/users/server/infrastructure/dal/create";
import { getAppDb } from "@/server-core/db/db.connection";
import { deriveFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod/derive-field-names-from-schema";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import {
  createEmptyDenseFieldErrorMap,
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/utilities/factories/create-error-map.factory";
import {
  formError,
  formOk,
} from "@/shared/forms/utilities/factories/create-form-result.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";

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
      logger.warn("User creation returned empty result", {
        context: "createUserAction",
        safeMeta: { email, username },
      });
      return formError({
        fieldErrors: createEmptyDenseFieldErrorMap(allowed),
        message: USER_ERROR_MESSAGES.createFailed,
      });
    }

    return formOk(user, USER_SUCCESS_MESSAGES.createSuccess);
  } catch (error) {
    logger.error(USER_ERROR_MESSAGES.unexpected, {
      context: "createUserAction",
      error,
    });
    return formError({
      fieldErrors: toDenseFieldErrorMap({}, allowed),
      message: USER_ERROR_MESSAGES.unexpected,
    });
  }
}
