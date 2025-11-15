"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { USERS_DASHBOARD_PATH } from "@/features/users/lib/constants";
import { USER_ERROR_MESSAGES } from "@/features/users/lib/messages";
import { getAppDb } from "@/server/db/db.connection";
import { deleteUserDal } from "@/server/users/dal/delete";
import { toUserId } from "@/shared/branding/id-converters";
import type { LegacyFormState } from "@/shared/forms/legacy/legacy-form.types";
import { logger } from "@/shared/logging/logger.shared";

/**
 * Deletes a user by ID, revalidates and redirects.
 */
export async function deleteUserAction(
  id: string,
): Promise<LegacyFormState<"_root">> {
  let result: LegacyFormState<"_root"> = {
    errors: { _root: [USER_ERROR_MESSAGES.unexpected] },
    message: USER_ERROR_MESSAGES.unexpected,
    success: false,
  };

  try {
    const db = getAppDb();
    const deletedUser = await deleteUserDal(db, toUserId(id));

    if (deletedUser) {
      revalidatePath(USERS_DASHBOARD_PATH);
      redirect(USERS_DASHBOARD_PATH);
    } else {
      result = {
        errors: { _root: [USER_ERROR_MESSAGES.notFoundOrDeleteFailed] },
        message: USER_ERROR_MESSAGES.notFoundOrDeleteFailed,
        success: false,
      };
    }
  } catch (error) {
    logger.error(USER_ERROR_MESSAGES.unexpected, {
      context: "deleteUserAction",
      error,
      id,
    });
    result = {
      errors: { _root: [USER_ERROR_MESSAGES.unexpected] },
      message: USER_ERROR_MESSAGES.unexpected,
      success: false,
    };
  }

  return result;
}
