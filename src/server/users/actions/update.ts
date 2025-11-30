"use server";

import { revalidatePath } from "next/cache";
import { asPasswordHash } from "@/features/auth/lib/password.types";
import { USERS_DASHBOARD_PATH } from "@/features/users/lib/constants";
import type { UserDto } from "@/features/users/lib/dto";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/features/users/lib/messages";
import {
  type EditUserFormFieldNames,
  EditUserFormSchema,
  type EditUserFormValues,
} from "@/features/users/lib/user.schema";
import { hashWithSaltRounds } from "@/server/auth/infrastructure/adapters/password-hasher-bcrypt.adapter";
import { getAppDb } from "@/server/db/db.connection";
import { validateForm } from "@/server/forms/validate-form";
import { readUserDal } from "@/server/users/dal/read";
import { updateUserDal } from "@/server/users/dal/update";
import type { UserUpdatePatch } from "@/server/users/types/types";
import { toUserIdResult } from "@/shared/branding/id-converters";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/domain/factories/create-error-map.factory";
import {
  formError,
  formOk,
} from "@/shared/forms/domain/factories/create-form-result.factory";
import type { FormResult } from "@/shared/forms/domain/types/form-result.types";
import { resolveCanonicalFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod/resolve-canonical-field-names";
import { logger } from "@/shared/logging/infra/logging.client";
import { diffShallowPatch } from "@/shared/utils/object/diff";

type DiffableUserFields = Pick<UserDto, "username" | "email" | "role">;

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
