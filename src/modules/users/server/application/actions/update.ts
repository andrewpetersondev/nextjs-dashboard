"use server";

import { revalidatePath } from "next/cache";
import { asPasswordHash } from "@/modules/auth/domain/password.types";
import { hashWithSaltRounds } from "@/modules/auth/server/infrastructure/adapters/password-hasher-bcrypt.adapter";
import { USERS_DASHBOARD_PATH } from "@/modules/users/domain/user.constants";
import type { UserDto } from "@/modules/users/domain/user.dto";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/modules/users/domain/user.messages";
import {
  type EditUserFormFieldNames,
  EditUserFormSchema,
  type EditUserFormValues,
} from "@/modules/users/lib/user.schema";
import type { UserUpdatePatch } from "@/modules/users/server/domain/types";
import { readUserDal } from "@/modules/users/server/infrastructure/dal/read";
import { updateUserDal } from "@/modules/users/server/infrastructure/dal/update";
import { getAppDb } from "@/server/db/db.connection";
import { validateForm } from "@/server/forms/validate-form";
import { toUserIdResult } from "@/shared/branding/converters/id-converters";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/domain/factories/create-error-map.factory";
import {
  formError,
  formOk,
} from "@/shared/forms/domain/factories/create-form-result.factory";
import type { FormResult } from "@/shared/forms/domain/types/form-result.types";
import { resolveCanonicalFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod/resolve-canonical-field-names";
import { logger } from "@/shared/logging/infrastructure/logging.client";

type DiffableUserFields = Pick<UserDto, "username" | "email" | "role">;

/**
 * Computes a shallow difference between a base object and a candidate patch.
 *
 * @typeParam T - A record-like shape of comparable fields.
 * @param base - The source object to compare against.
 * @param patch - Candidate values to apply; only differing keys are returned.
 * @returns A partial object containing only keys whose values differ from `base`.
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

/**
 * Validates user ID format and returns error result if invalid.
 */
function idInvalidResult<F extends string>(
  fields: readonly F[],
): FormResult<never> {
  return formError<F>({
    fieldErrors: createEmptyDenseFieldErrorMap(fields),
    message: USER_ERROR_MESSAGES.validationFailed,
  });
}

/**
 * Returns error result when user is not found.
 */
function notFoundResult<F extends string>(
  fields: readonly F[],
): FormResult<never> {
  return formError<F>({
    fieldErrors: createEmptyDenseFieldErrorMap(fields),
    message: USER_ERROR_MESSAGES.notFound,
  });
}

/**
 * Builds a typed patch object from form input and existing user data.
 *
 * @remarks
 * - Only includes fields that have meaningful changes
 * - Trims and normalizes string inputs
 * - Validates role against allowed enum values
 * - Hashes password if provided and non-empty
 */
async function buildPatch(
  existing: DiffableUserFields,
  data: {
    username?: string | null;
    email?: string | null;
    role?: UserDto["role"] | null;
    password?: string | null;
  },
): Promise<UserUpdatePatch> {
  // Normalize inputs and enforce types
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

  const password =
    typeof data.password === "string" && data.password.length > 0
      ? asPasswordHash(await hashWithSaltRounds(data.password))
      : undefined;

  return { ...diff, ...(password ? { password } : {}) };
}

/**
 * Updates an existing user (admin only).
 *
 * Type-safe server action with:
 * - ID validation
 * - Schema-based form validation
 * - Shallow diff to prevent unnecessary updates
 * - Automatic password hashing
 * - Cache revalidation
 *
 * @returns FormResult<unknown> wrapping FormSuccess<UserDto>  AppError
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <not my focus>
export async function updateUserAction(
  id: string,
  _prevState: FormResult<unknown>,
  formData: FormData,
): Promise<FormResult<unknown>> {
  const fields = resolveCanonicalFieldNamesFromSchema<
    EditUserFormValues,
    EditUserFormFieldNames
  >(EditUserFormSchema);

  // Validate user ID
  const idRes = toUserIdResult(id);
  if (!idRes.ok) {
    return idInvalidResult(fields);
  }

  // Validate form data against schema
  const validated = await validateForm(formData, EditUserFormSchema, fields);

  if (!validated.ok) {
    return validated;
  }

  try {
    const db = getAppDb();

    // Read existing user
    const existing = await readUserDal(db, idRes.value);
    if (!existing) {
      return notFoundResult(fields);
    }

    // Build typed patch from validated data and existing user
    const patch = await buildPatch(
      {
        email: existing.email,
        role: existing.role,
        username: existing.username,
      },
      validated.value.data,
    );

    // If no changes, return success with current user
    if (Object.keys(patch).length === 0) {
      return formOk(existing, USER_SUCCESS_MESSAGES.noChanges);
    }

    // Apply patch to database
    const updated = await updateUserDal(db, idRes.value, patch);
    if (!updated) {
      return formError<EditUserFormFieldNames>({
        fieldErrors: createEmptyDenseFieldErrorMap(fields),
        message: USER_ERROR_MESSAGES.updateFailed,
      });
    }

    // Revalidate cache and return success
    revalidatePath(USERS_DASHBOARD_PATH);
    return formOk(updated, USER_SUCCESS_MESSAGES.updateSuccess);
  } catch (error: unknown) {
    logger.error(USER_ERROR_MESSAGES.unexpected, {
      context: "updateUserAction",
      error,
      id,
    });

    return formError<EditUserFormFieldNames>({
      fieldErrors: createEmptyDenseFieldErrorMap(fields),
      message: USER_ERROR_MESSAGES.unexpected,
    });
  }
}
