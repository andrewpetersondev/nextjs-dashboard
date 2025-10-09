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
import { getAppDb } from "@/server/db/db.connection";
import { validateFormGeneric } from "@/server/forms/validate-form";
import { serverLogger } from "@/server/logging/serverLogger";
import { readUserDal } from "@/server/users/dal/read";
import { updateUserDal } from "@/server/users/dal/update";
import type { UserUpdatePatch } from "@/server/users/types/types";
import { toUserIdResult } from "@/shared/domain/id-converters";
import { resolveFieldNamesFromSchema } from "@/shared/forms/fields/field-names.resolve";
import { extractRawRecordFromFormData } from "@/shared/forms/fields/formdata.extractor";
import { mapResultToFormResult } from "@/shared/forms/mapping/result-to-form-result.mapper";
import type { FormResult } from "@/shared/forms/types/form-result.type";
import { diffShallowPatch } from "@/shared/utils/object/diff";

type DiffableUserFields = Pick<UserDto, "username" | "email" | "role">;

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <todo fix later>
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
    return mapResultToFormResult(
      {
        error: {
          fieldErrors: {} as never,
          message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
        },
        ok: false,
      },
      { failureMessage: USER_ERROR_MESSAGES.VALIDATION_FAILED, fields, raw },
    );
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
      return mapResultToFormResult(
        {
          error: {
            fieldErrors: {} as never,
            message: USER_ERROR_MESSAGES.NOT_FOUND,
          },
          ok: false,
        },
        { failureMessage: USER_ERROR_MESSAGES.NOT_FOUND, fields, raw },
      );
    }

    const data = validated.value.data;
    const base: DiffableUserFields = {
      email: existing.email,
      role: existing.role,
      username: existing.username,
    };
    const candidate: Partial<DiffableUserFields> = {
      ...(data.username ? { username: data.username } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.role ? { role: data.role } : {}),
    };
    const diff = diffShallowPatch<DiffableUserFields>(base, candidate);
    const password =
      data.password && data.password.length > 0
        ? await hashPassword(data.password)
        : undefined;
    const patch: UserUpdatePatch = {
      ...diff,
      ...(password ? { password } : {}),
    };

    if (Object.keys(patch).length === 0) {
      return {
        ok: true,
        value: { data: existing, message: USER_SUCCESS_MESSAGES.NO_CHANGES },
      };
    }

    const updated = await updateUserDal(db, idRes.value, patch);
    if (!updated) {
      return mapResultToFormResult(
        {
          error: {
            fieldErrors: {} as never,
            message: USER_ERROR_MESSAGES.UPDATE_FAILED,
          },
          ok: false,
        },
        { failureMessage: USER_ERROR_MESSAGES.UPDATE_FAILED, fields, raw },
      );
    }

    revalidatePath(USERS_DASHBOARD_PATH);
    return {
      ok: true,
      value: { data: updated, message: USER_SUCCESS_MESSAGES.UPDATE_SUCCESS },
    };
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
          message: USER_ERROR_MESSAGES.UNEXPECTED,
        },
        ok: false,
      },
      { failureMessage: USER_ERROR_MESSAGES.UNEXPECTED, fields, raw },
    );
  }
}
