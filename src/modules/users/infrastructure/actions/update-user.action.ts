"use server";

import { revalidatePath } from "next/cache";
import type { UserDto } from "@/modules/users/application/dto/user.dto";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/modules/users/domain/user.constants";
import {
  type EditUserData,
  type EditUserFormFieldNames,
  EditUserFormSchema,
} from "@/modules/users/domain/user.schema";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { toUserIdResult } from "@/shared/branding/converters/id-converters";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeEmptyDenseFieldErrorMap } from "@/shared/forms/logic/factories/field-error-map.factory";
import {
  makeFormError,
  makeFormOk,
} from "@/shared/forms/logic/factories/form-result.factory";
import { resolveCanonicalFieldNames } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { validateForm } from "@/shared/forms/server/validate-form.logic";
import { ROUTES } from "@/shared/routes/routes";

type DiffableUserFields = Pick<UserDto, "username" | "email" | "role">;

/**
 * Computes a shallow difference between a base object and a candidate patch.
 */
function diffShallowPatch<T extends Record<string, unknown>>(
  base: T,
  patch: Partial<T>,
): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(patch) as Array<keyof T>) {
    const nextVal = patch[key];
    if (nextVal !== undefined && base[key] !== nextVal) {
      out[key] = nextVal;
    }
  }
  return out;
}

function idInvalidResult<F extends string>(
  fields: readonly F[],
): FormResult<never> {
  return makeFormError<F>({
    fieldErrors: makeEmptyDenseFieldErrorMap(fields),
    formData: {} as Readonly<Partial<Record<F, string>>>,
    formErrors: [],
    key: APP_ERROR_KEYS.validation,
    message: USER_ERROR_MESSAGES.validationFailed,
  });
}

function notFoundResult<F extends string>(
  fields: readonly F[],
): FormResult<never> {
  return makeFormError<F>({
    fieldErrors: makeEmptyDenseFieldErrorMap(fields),
    formData: {} as Readonly<Partial<Record<F, string>>>,
    formErrors: [],
    key: APP_ERROR_KEYS.not_found,
    message: USER_ERROR_MESSAGES.notFound,
  });
}

/**
 * Builds a typed patch object from form input and existing user data.
 * Returns a patch suitable for the Service (raw password).
 */
function buildPatch(
  existing: DiffableUserFields,
  data: EditUserData,
): EditUserData {
  const nextUsername =
    typeof data.username === "string" && data.username.trim().length > 0
      ? data.username.trim()
      : undefined;
  const nextEmail =
    typeof data.email === "string" && data.email.trim().length > 0
      ? data.email.trim()
      : undefined;
  const nextRole: DiffableUserFields["role"] | undefined =
    data.role &&
    (["ADMIN", "USER", "GUEST"] as const).includes(
      data.role as DiffableUserFields["role"],
    )
      ? (data.role as DiffableUserFields["role"])
      : undefined;

  const candidate: Partial<DiffableUserFields> = {
    ...(nextUsername ? { username: nextUsername } : {}),
    ...(nextEmail ? { email: nextEmail } : {}),
    ...(nextRole ? { role: nextRole } : {}),
  };

  const diff = diffShallowPatch<DiffableUserFields>(existing, candidate);

  // Pass raw password to service; service handles hashing
  const password =
    typeof data.password === "string" && data.password.length > 0
      ? data.password
      : undefined;

  return { ...diff, ...(password ? { password } : {}) };
}

/**
 * Updates an existing user (admin only).
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
export async function updateUserAction(
  id: string,
  _prevState: FormResult<unknown>,
  formData: FormData,
): Promise<FormResult<unknown>> {
  const fields = resolveCanonicalFieldNames<
    EditUserData,
    EditUserFormFieldNames
  >(EditUserFormSchema);

  const idRes = toUserIdResult(id);
  if (!idRes.ok) {
    return idInvalidResult(fields);
  }

  const validated = await validateForm(formData, EditUserFormSchema, fields);

  if (!validated.ok) {
    return validated;
  }

  try {
    const db = getAppDb();
    const service = createUserService(db);

    // Read existing user via service
    const existing = await service.findUserById(idRes.value);
    if (!existing) {
      return notFoundResult(fields);
    }

    // Build typed patch
    const patch = buildPatch(
      {
        email: existing.email,
        role: existing.role,
        username: existing.username,
      },
      validated.value.data,
    );

    if (Object.keys(patch).length === 0) {
      return makeFormOk(existing, USER_SUCCESS_MESSAGES.noChanges);
    }

    // Apply patch via service
    const result = await service.updateUser(idRes.value, patch);

    if (!result.ok) {
      return makeFormError<EditUserFormFieldNames>({
        fieldErrors: makeEmptyDenseFieldErrorMap(fields),
        formData: {} as Readonly<
          Partial<Record<EditUserFormFieldNames, string>>
        >,
        formErrors: [],
        key: APP_ERROR_KEYS.validation,
        message: result.error.message || USER_ERROR_MESSAGES.updateFailed,
      });
    }

    revalidatePath(ROUTES.dashboard.users);
    return makeFormOk(result.value, USER_SUCCESS_MESSAGES.updateSuccess);
  } catch (_error: unknown) {
    return makeFormError<EditUserFormFieldNames>({
      fieldErrors: makeEmptyDenseFieldErrorMap(fields),
      formData: {} as Readonly<Partial<Record<EditUserFormFieldNames, string>>>,
      formErrors: [],
      key: APP_ERROR_KEYS.unexpected,
      message: USER_ERROR_MESSAGES.unexpected,
    });
  }
}
