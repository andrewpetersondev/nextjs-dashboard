"use server";

import { revalidatePath } from "next/cache";
import { toUserRole } from "@/features/users/lib/to-user-role";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/features/users/messages";
import { EditUserFormSchema } from "@/features/users/schema.client";
import type { EditUserFormFieldNames } from "@/features/users/types";
import { hashPassword } from "@/server/auth/hashing";
import { getDB } from "@/server/db/connection";
import { logger } from "@/server/logging/logger";
import { readUserDal } from "@/server/users/dal/read";
import { updateUserDal } from "@/server/users/dal/update";
import type { UserDto } from "@/server/users/dto";
import { toUserId } from "@/shared/brands/domain-brands";
import type { FormState } from "@/shared/forms/types";
import {
  deriveAllowedFieldsFromSchema,
  mapFieldErrors,
} from "@/shared/forms/utils";
import { stripProperties } from "@/shared/utils/general";

/**
 * Edits an existing user.
 */
export async function updateUserAction(
  id: string,
  _prevState: FormState<EditUserFormFieldNames>,
  formData: FormData,
): Promise<FormState<EditUserFormFieldNames>> {
  const db = getDB();
  try {
    const payload = { ...Object.fromEntries(formData.entries()) };
    const clean = stripProperties(payload);
    const validated = EditUserFormSchema.safeParse(clean);

    if (!validated.success) {
      const allowed = deriveAllowedFieldsFromSchema(EditUserFormSchema);
      return {
        errors: mapFieldErrors(validated.error.flatten().fieldErrors, allowed),
        message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }

    const existingUser: UserDto | null = await readUserDal(db, toUserId(id));
    if (!existingUser) {
      return {
        errors: {},
        message: USER_ERROR_MESSAGES.NOT_FOUND,
        success: false,
      };
    }

    const patch: Record<string, unknown> = {};

    if (
      validated.data.username &&
      validated.data.username !== existingUser.username
    ) {
      patch.username = validated.data.username;
    }

    if (validated.data.email && validated.data.email !== existingUser.email) {
      patch.email = validated.data.email;
    }

    if (validated.data.role && validated.data.role !== existingUser.role) {
      patch.role = toUserRole(validated.data.role);
    }

    if (validated.data.password && validated.data.password.length > 0) {
      patch.password = await hashPassword(validated.data.password);
    }

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
      toUserId(id),
      patch,
    );

    if (!updatedUser) {
      return {
        errors: {},
        message: USER_ERROR_MESSAGES.UPDATE_FAILED,
        success: false,
      };
    }
    revalidatePath("/dashboard/users");
    return {
      data: updatedUser,
      message: USER_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "updateUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });
    return {
      errors: {}, // TODO: return a more specific error message
      message: USER_ERROR_MESSAGES.UPDATE_FAILED,
      success: false,
    };
  }
}
