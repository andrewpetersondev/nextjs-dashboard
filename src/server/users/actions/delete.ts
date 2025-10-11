"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { USERS_DASHBOARD_PATH } from "@/features/users/lib/constants";
import { USER_ERROR_MESSAGES } from "@/features/users/lib/messages";
import { getAppDb } from "@/server/db/db.connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { deleteUserDal } from "@/server/users/dal/delete";
import { toUserId } from "@/shared/domain/id-converters";
import type { LegacyFormState } from "@/shared/forms/types/legacy-form.types";

/**
 * Deletes a user by ID, revalidates and redirects.
 */
export async function deleteUserAction(
  id: string,
): Promise<LegacyFormState<"_root">> {
  let result: LegacyFormState<"_root"> = {
    errors: { _root: [USER_ERROR_MESSAGES.UNEXPECTED] },
    message: USER_ERROR_MESSAGES.UNEXPECTED,
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
        errors: { _root: [USER_ERROR_MESSAGES.NOT_FOUND_OR_DELETE_FAILED] },
        message: USER_ERROR_MESSAGES.NOT_FOUND_OR_DELETE_FAILED,
        success: false,
      };
    }
  } catch (error) {
    serverLogger.error({
      context: "deleteUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });
    result = {
      errors: { _root: [USER_ERROR_MESSAGES.UNEXPECTED] },
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    };
  }

  return result;
}
