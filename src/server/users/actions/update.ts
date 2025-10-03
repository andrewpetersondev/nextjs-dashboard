/**
 * @file Basic helpers and server action for updating a user.
 * Initializes form context, validates input, builds a diff-based patch, and persists updates.
 */

"use server";

import { revalidatePath } from "next/cache";
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
import { hashPassword } from "@/server/auth/hashing";
import { getDB } from "@/server/db/connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { readUserDal } from "@/server/users/dal/read";
import { updateUserDal } from "@/server/users/dal/update";
import type { UserUpdatePatch } from "@/server/users/types/types";
import { toUserIdResult } from "@/shared/domain/id-converters";
import { expandSparseErrorsToDense } from "@/shared/forms/errors/error-map-utils";
import { resolveSchemaFieldNames } from "@/shared/forms/fields/field-name-resolution";
import { mapResultToFormState } from "@/shared/forms/mapping/result-to-form-state.mapping";
import type { LegacyFormState } from "@/shared/forms/types/form-state.type";
import { extractRawFromFormData } from "@/shared/forms/utils/formdata.util";
import { diffShallowPatch } from "@/shared/utils/object/diff";

// Helpers for brevity and strict typing
/** Selectable user fields used for diffing. */
type DiffableUserFields = Pick<UserDto, "username" | "email" | "role">;
/** Shared form context for validation and error handling. */
type Ctx = {
  readonly fields: readonly EditUserFormFieldNames[];
  readonly raw: Record<string, unknown>;
  readonly emptyDense: ReturnType<
    typeof expandSparseErrorsToDense<EditUserFormFieldNames>
  >;
};

/**
 * Builds shared context (allowed fields, raw values, empty errors) from FormData.
 * @param formData - Incoming FormData from the client.
 */
function initCtx(formData: FormData): Ctx {
  const fields = resolveSchemaFieldNames<
    EditUserFormFieldNames,
    EditUserFormValues
  >(EditUserFormSchema);
  const raw = extractRawFromFormData(formData, fields);
  const emptyDense = expandSparseErrorsToDense<EditUserFormFieldNames>(
    {},
    fields,
  );
  return { emptyDense, fields, raw };
}

/**
 * Returns a failed FormState with a given message using the provided context.
 * @param message - Human-friendly failure message.
 * @param ctx - Context carrying fields, raw, and empty errors.
 */
function fail(
  message: string,
  ctx: Ctx,
): LegacyFormState<EditUserFormFieldNames> {
  return mapResultToFormState(
    { error: ctx.emptyDense, ok: false },
    { failureMessage: message, fields: ctx.fields, raw: ctx.raw },
  );
}

/**
 * Validates and normalizes the form data against the edit schema.
 * @param formData - Incoming FormData from the client.
 * @param ctx - Validation context with fields and raw values.
 */
async function validateForm(
  formData: FormData,
  ctx: Ctx,
): Promise<LegacyFormState<EditUserFormFieldNames, EditUserFormValues>> {
  const result = await validateFormGeneric(
    formData,
    EditUserFormSchema,
    ctx.fields,
    {
      fields: ctx.fields,
      raw: ctx.raw,
    },
  );
  return result;
}

/**
 * Builds a minimal update patch by diffing validated data against the existing user.
 * Hashes password when provided.
 * @param existing - Current persisted user.
 * @param data - Normalized, validated input.
 */
async function buildPatch(
  existing: UserDto,
  data: EditUserFormValues,
): Promise<UserUpdatePatch> {
  const base: DiffableUserFields = {
    email: existing.email,
    role: existing.role,
    username: existing.username,
  };
  const candidate: Partial<DiffableUserFields> = {
    ...(data.username ? { username: data.username } : {}),
    ...(data.email ? { email: data.email } : {}),
    // role is already UserRole | undefined thanks to schema; no need to reconvert/throw
    ...(data.role ? { role: data.role } : {}),
  };
  const diff = diffShallowPatch<DiffableUserFields>(base, candidate);
  const password =
    data.password && data.password.length > 0
      ? await hashPassword(data.password)
      : undefined;
  return { ...diff, ...(password ? { password } : {}) };
}

/**
 * Server action: validates input, computes patch, updates the user, and revalidates.
 * @param id - Target user ID.
 * @param _prevState - Previous form state (unused).
 * @param formData - Submitted form payload.
 *
 * @remarks - TODO: THIS FORM OR FORM-ACTION NO LONGER ACCEPTS PARTIAL INPUTS
 */
export async function updateUserAction(
  id: string,
  _prevState: LegacyFormState<EditUserFormFieldNames>,
  formData: FormData,
): Promise<LegacyFormState<EditUserFormFieldNames>> {
  const ctx = initCtx(formData);
  const idRes = toUserIdResult(id);
  if (!idRes.ok) {
    return fail(USER_ERROR_MESSAGES.VALIDATION_FAILED, ctx);
  }

  const validated = await validateForm(formData, ctx);
  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  try {
    const db = getDB();
    const existing = await readUserDal(db, idRes.value);
    if (!existing) {
      return fail(USER_ERROR_MESSAGES.NOT_FOUND, ctx);
    }

    const patch = await buildPatch(existing, validated.data);
    if (Object.keys(patch).length === 0) {
      return {
        data: existing,
        message: USER_SUCCESS_MESSAGES.NO_CHANGES,
        success: true,
      };
    }

    const updated = await updateUserDal(db, idRes.value, patch);
    if (!updated) {
      return fail(USER_ERROR_MESSAGES.UPDATE_FAILED, ctx);
    }

    revalidatePath(USERS_DASHBOARD_PATH);
    return {
      data: updated,
      message: USER_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error: unknown) {
    serverLogger.error({
      context: "updateUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });
    return fail(USER_ERROR_MESSAGES.UNEXPECTED, ctx);
  }
}
