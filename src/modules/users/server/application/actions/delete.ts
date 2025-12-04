"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { USERS_DASHBOARD_PATH } from "@/modules/users/domain/user.constants";
import { USER_ERROR_MESSAGES } from "@/modules/users/domain/user.messages";
import { deleteUserDal } from "@/modules/users/server/infrastructure/dal/delete";
import { getAppDb } from "@/server-core/db/db.connection";
import { toUserId } from "@/shared/branding/converters/id-converters";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { formError } from "@/shared/forms/utilities/factories/create-form-result.factory";
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
