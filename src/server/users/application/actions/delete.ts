"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { USERS_DASHBOARD_PATH } from "@/features/users/lib/constants";
import { USER_ERROR_MESSAGES } from "@/features/users/lib/messages";
import { getAppDb } from "@/server/db/db.connection";
import { deleteUserDal } from "@/server/users/infrastructure/dal/delete";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { formError } from "@/shared/forms/domain/factories/create-form-result.factory";
import type { FormResult } from "@/shared/forms/domain/types/form-result.types";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Deletes a user by ID, revalidates and redirects.
 */
export async function deleteUserAction(id: string): Promise<FormResult<never>> {
  try {
    const db = getAppDb();
    const deletedUser = await deleteUserDal(db, toUserId(id));

    if (deletedUser) {
      revalidatePath(USERS_DASHBOARD_PATH);
      redirect(USERS_DASHBOARD_PATH);
    }

    return formError<"_root">({
      fieldErrors: { _root: [USER_ERROR_MESSAGES.notFoundOrDeleteFailed] },
      message: USER_ERROR_MESSAGES.notFoundOrDeleteFailed,
    });
  } catch (error) {
    logger.error(USER_ERROR_MESSAGES.unexpected, {
      context: "deleteUserAction",
      error,
      id,
    });

    return formError<"_root">({
      fieldErrors: { _root: [USER_ERROR_MESSAGES.unexpected] },
      message: USER_ERROR_MESSAGES.unexpected,
    });
  }
}
