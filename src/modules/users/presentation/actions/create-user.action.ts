"use server";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/modules/users/domain/constants/user.constants";
import {
  type CreateUserData,
  CreateUserFormSchema,
} from "@/modules/users/domain/schemas/user.schema";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/factories/field-error-map.factory";
import {
  makeFormError,
  makeFormOk,
} from "@/shared/forms/logic/factories/form-result.factory";
import { resolveCanonicalFieldNames } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { validateForm } from "@/shared/forms/server/validate-form.logic";
import { toUserRole } from "@/shared/validation/user/user-role.parser";

/**
 * Creates a new user (admin only).
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: fix
export async function createUserAction(
  _prevState: FormResult<unknown>,
  formData: FormData,
): Promise<FormResult<unknown>> {
  const db = getAppDb();

  const allowed = resolveCanonicalFieldNames<
    CreateUserData,
    keyof CreateUserData & string
  >(CreateUserFormSchema);

  try {
    const validation = await validateForm<
      CreateUserData,
      keyof CreateUserData & string
    >(formData, CreateUserFormSchema, allowed, {
      messages: { failureMessage: USER_ERROR_MESSAGES.validationFailed },
    });

    if (!validation.ok) {
      return validation;
    }

    const { data } = validation.value;

    // Map role string to UserRole using the suggested parser
    const roleResult = toUserRole(data.role);

    if (!roleResult.ok) {
      return makeFormError({
        fieldErrors: makeEmptyDenseFieldErrorMap(allowed),
        formData: {} as Readonly<
          Partial<Record<(typeof allowed)[number], string>>
        >,
        formErrors: [],
        key: APP_ERROR_KEYS.validation,
        message: roleResult.error.message,
      });
    }

    const role = roleResult.value;

    const { username, email, password } = data;

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
        formData: {} as Readonly<
          Partial<Record<(typeof allowed)[number], string>>
        >,
        formErrors: [],
        key: APP_ERROR_KEYS.validation,
        message: result.error.message || USER_ERROR_MESSAGES.createFailed,
      });
    }

    return makeFormOk(result.value, USER_SUCCESS_MESSAGES.createSuccess);
  } catch (_error: unknown) {
    // Catch generic unexpected errors not caught by service
    return makeFormError({
      fieldErrors: makeEmptyDenseFieldErrorMap(allowed),
      formData: {} as Readonly<
        Partial<Record<(typeof allowed)[number], string>>
      >,
      formErrors: [],
      key: APP_ERROR_KEYS.unexpected,
      message: USER_ERROR_MESSAGES.unexpected,
    });
  }
}
