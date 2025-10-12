// Refactor: extract helpers to keep updateUserAction ≤50 lines.
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
import { hashPassword } from "@/server/auth/crypto/hashing";
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { readUserDal } from "@/server/users/dal/read";
import { updateUserDal } from "@/server/users/dal/update";
import type { UserUpdatePatch } from "@/server/users/types/types";
import { toUserIdResult } from "@/shared/domain/id-converters";
import { resolveFieldNamesFromSchema } from "@/shared/forms/fields/field-names.resolve";
import { extractRawRecordFromFormData } from "@/shared/forms/fields/formdata.extractor";
import {
  mapResultToFormResult,
  toFormOk,
} from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { diffShallowPatch } from "@/shared/utils/object/diff";

type DiffableUserFields = Pick<UserDto, "username" | "email" | "role">;

function idInvalidResult<F extends string>(
  fields: readonly F[],
  raw: Readonly<Record<string, unknown>>,
): FormResult<F, never> {
  return mapResultToFormResult(
    {
      error: {
        fieldErrors: {} as never,
        kind: "validation",
        message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
      },
      ok: false,
    },
    { failureMessage: USER_ERROR_MESSAGES.VALIDATION_FAILED, fields, raw },
  );
}

function notFoundResult<F extends string>(
  fields: readonly F[],
  raw: Readonly<Record<string, unknown>>,
): FormResult<F, never> {
  return mapResultToFormResult(
    {
      error: {
        fieldErrors: {} as never,
        kind: "validation",
        message: USER_ERROR_MESSAGES.NOT_FOUND,
      },
      ok: false,
    },
    { failureMessage: USER_ERROR_MESSAGES.NOT_FOUND, fields, raw },
  );
}

async function buildPatch(
  existing: DiffableUserFields,
  data: {
    username?: string | null;
    email?: string | null;
    role?: UserDto["role"] | null; // ensure role narrows to valid enum
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
      ? await hashPassword(data.password)
      : undefined;

  return { ...diff, ...(password ? { password } : {}) };
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <kept under 50 lines>
export async function updateUserAction(
  id: string,
  _prevState: FormResult<EditUserFormFieldNames, unknown>,
  formData: FormData,
): Promise<FormResult<EditUserFormFieldNames, UserDto>> {
  const fields = resolveFieldNamesFromSchema<
    EditUserFormFieldNames,
    EditUserFormValues
  >(EditUserFormSchema);
  const raw = extractRawRecordFromFormData(formData, fields);
  const idRes = toUserIdResult(id);
  if (!idRes.ok) {
    return idInvalidResult(fields, raw);
  }

  const validated = await validateFormGeneric(
    formData,
    EditUserFormSchema,
    fields,
    { fields, raw },
  );
  if (!validated.ok) {
    return mapResultToFormResult(validated, { fields, raw });
  }

  try {
    const db = getAppDb();
    const existing = await readUserDal(db, idRes.value);
    if (!existing) {
      return notFoundResult(fields, raw);
    }

    const patch = await buildPatch(
      {
        email: existing.email,
        role: existing.role,
        username: existing.username,
      },
      validated.value.data,
    );
    if (Object.keys(patch).length === 0) {
      return toFormOk<EditUserFormFieldNames, UserDto>(existing, {
        successMessage: USER_SUCCESS_MESSAGES.NO_CHANGES,
      });
    }

    const updated = await updateUserDal(db, idRes.value, patch);
    if (!updated) {
      return mapResultToFormResult(
        {
          error: {
            fieldErrors: {} as never,
            kind: "validation",
            message: USER_ERROR_MESSAGES.UPDATE_FAILED,
          },
          ok: false,
        },
        { failureMessage: USER_ERROR_MESSAGES.UPDATE_FAILED, fields, raw },
      );
    }

    revalidatePath(USERS_DASHBOARD_PATH);
    return toFormOk<EditUserFormFieldNames, UserDto>(updated, {
      successMessage: USER_SUCCESS_MESSAGES.UPDATE_SUCCESS,
    });
  } catch (error: unknown) {
    serverLogger.error({
      context: "updateUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });
    return mapResultToFormResult(
      {
        error: {
          fieldErrors: {} as never,
          kind: "validation",
          message: USER_ERROR_MESSAGES.UNEXPECTED,
        },
        ok: false,
      },
      { failureMessage: USER_ERROR_MESSAGES.UNEXPECTED, fields, raw },
    );
  }
}
