"use server";

import { normalizeUserRole } from "@/modules/users/domain/role/user.role.parser";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/modules/users/domain/user.messages";
import {
  type CreateUserFormInput,
  CreateUserFormSchema,
} from "@/modules/users/domain/user.schema";
import { createUserService } from "@/modules/users/server/application/services/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import {
  makeEmptyDenseFieldErrorMap,
  selectSparseFieldErrors,
  toDenseFieldErrorMap,
} from "@/shared/forms/factories/field-error-map.factory";
import {
  makeFormError,
  makeFormOk,
} from "@/shared/forms/factories/form-result.factory";
import { toFieldNames } from "@/shared/forms/infrastructure/zod/schema-inspector";
import type { FormResult } from "@/shared/forms/types/form-result.dto";

const toOptionalString = (v: FormDataEntryValue | null): string | undefined =>
  typeof v === "string" ? v : undefined;

function pickCreateUserFormData(
  formData: FormData,
): Partial<CreateUserFormInput> {
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
  const allowed = toFieldNames(CreateUserFormSchema);

  try {
    const raw = pickCreateUserFormData(formData);
    const parsed = CreateUserFormSchema.safeParse({
      email: raw.email,
      password: raw.password,
      role: normalizeUserRole(raw.role),
      username: raw.username,
    });

    if (!parsed.success) {
      return makeFormError({
        fieldErrors: toDenseFieldErrorMap(
          selectSparseFieldErrors(parsed.error.flatten().fieldErrors, allowed),
          allowed,
        ),
        message: USER_ERROR_MESSAGES.validationFailed,
      });
    }

    const { username, email, password, role } = parsed.data;

    const service = createUserService(db);
    const result = await service.createUser({
      email,
      password,
      role,
      username,
    });

    if (!result.ok) {
      return makeFormError({
        fieldErrors: makeEmptyDenseFieldErrorMap(allowed),
        message: result.error.message || USER_ERROR_MESSAGES.createFailed,
      });
    }

    return makeFormOk(result.value, USER_SUCCESS_MESSAGES.createSuccess);
  } catch (_error: unknown) {
    // Catch generic unexpected errors not caught by service
    return makeFormError({
      fieldErrors: toDenseFieldErrorMap({}, allowed),
      message: USER_ERROR_MESSAGES.unexpected,
    });
  }
}
