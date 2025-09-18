"use server";

import { revalidatePath } from "next/cache";
import { USERS_DASHBOARD_PATH } from "@/features/users/constants";
import type { UserDto } from "@/features/users/dto/types";
import { toUserRole } from "@/features/users/lib/to-user-role";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/features/users/messages";
import {
  type EditUserFormFieldNames,
  EditUserFormSchema,
} from "@/features/users/schema/schema.shared";
import { hashPassword } from "@/server/auth/hashing";
import { getDB } from "@/server/db/connection";
import { toFormState } from "@/server/forms/adapters";
import { buildRawFromFormData } from "@/server/forms/helpers";
import { validateFormGeneric } from "@/server/forms/validation";
import { serverLogger } from "@/server/logging/serverLogger";
import { readUserDal } from "@/server/users/dal/read";
import { updateUserDal } from "@/server/users/dal/update";
import { toUserIdResult } from "@/shared/domain/id-converters";
import { toDenseFormErrors } from "@/shared/forms/errors";
import { deriveAllowedFieldsFromSchema } from "@/shared/forms/schema";
import type { FormState } from "@/shared/forms/types";
import { shallowDiff } from "@/shared/utils/patch";

/**
 * Edits an existing user.
 * Uses `validateFormGeneric` to validate the form data.
 * Uses `toFormState` to convert the result to a form state.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
export async function updateUserAction(
  id: string,
  _prevState: FormState<EditUserFormFieldNames>,
  formData: FormData,
): Promise<FormState<EditUserFormFieldNames>> {
  // Prepare fields list and raw values for consistency with other actions
  const fields = deriveAllowedFieldsFromSchema(EditUserFormSchema);
  const raw = buildRawFromFormData(formData, fields);
  const emptyDense = toDenseFormErrors<EditUserFormFieldNames>({}, fields);

  // Early id validation using Result-based converter to avoid throw/UNEXPECTED
  const idResult = toUserIdResult(id);
  if (!idResult.success) {
    return toFormState(
      { error: emptyDense, success: false },
      { failureMessage: USER_ERROR_MESSAGES.VALIDATION_FAILED, fields, raw },
    );
  }
  const userIdSafe = idResult.data;

  // Add normalization via transform to ensure consistent data shape (email/username/role)
  const result = await validateFormGeneric(
    formData,
    EditUserFormSchema,
    fields,
    {
      transform: async (data) => ({
        ...data,
        email:
          typeof data.email === "string"
            ? data.email.trim().toLowerCase()
            : data.email,
        role:
          typeof data.role === "string"
            ? data.role.trim().toLowerCase()
            : data.role,
        username:
          typeof data.username === "string"
            ? data.username.trim()
            : data.username,
      }),
    },
  );

  const validated = toFormState(result, {
    failureMessage: USER_ERROR_MESSAGES.VALIDATION_FAILED,
    fields,
    raw,
  });

  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  try {
    const db = getDB();

    const existingUser: UserDto | null = await readUserDal(db, userIdSafe);
    if (!existingUser) {
      return toFormState(
        { error: emptyDense, success: false },
        { failureMessage: USER_ERROR_MESSAGES.NOT_FOUND, fields, raw },
      );
    }

    // Prepare strongly-typed base for shallow diff (only fields we compare)
    type DiffableUserFields = Pick<UserDto, "username" | "email" | "role">;
    const baseForDiff: DiffableUserFields = {
      email: existingUser.email,
      role: existingUser.role,
      username: existingUser.username,
    };

    // Build candidate patch using normalized, validated data
    const candidatePatch: Partial<DiffableUserFields> = {
      ...(validated.data.username ? { username: validated.data.username } : {}),
      ...(validated.data.email ? { email: validated.data.email } : {}),
      ...(validated.data.role ? { role: toUserRole(validated.data.role) } : {}),
    };

    // Optional password (normalized to undefined when empty)
    let hashedPassword: string | undefined;
    if (validated.data.password) {
      hashedPassword = await hashPassword(validated.data.password);
    }

    // Keep only fields that actually differ from existingUser
    const diffPatch = shallowDiff<DiffableUserFields>(
      baseForDiff,
      candidatePatch,
    );

    // Compose final patch including password if provided
    const patch: Record<string, unknown> = {
      ...diffPatch,
      ...(hashedPassword ? { password: hashedPassword } : {}),
    };

    // If no fields have changed, return early
    if (Object.keys(patch).length === 0) {
      return {
        data: existingUser,
        message: USER_SUCCESS_MESSAGES.NO_CHANGES,
        success: true,
      };
    }

    const updatedUser: UserDto | null = await updateUserDal(
      db,
      userIdSafe,
      patch,
    );

    if (!updatedUser) {
      return {
        errors: {},
        message: USER_ERROR_MESSAGES.UPDATE_FAILED,
        success: false,
      };
    }
    revalidatePath(USERS_DASHBOARD_PATH);
    return {
      data: updatedUser,
      message: USER_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    serverLogger.error({
      context: "updateUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });
    return {
      errors: {}, // TODO: return a more specific error message
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    };
  }
}
