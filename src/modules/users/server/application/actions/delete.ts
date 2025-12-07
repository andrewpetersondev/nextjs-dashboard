"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { USER_ERROR_MESSAGES } from "@/modules/users/domain/user.messages";
import { createUserService } from "@/modules/users/server/application/services/factories/user-service.factory";
import { getAppDb } from "@/server-core/db/db.connection";
import { toUserId } from "@/shared/branding/converters/id-converters";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { formError } from "@/shared/forms/utilities/factories/create-form-result.factory";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Deletes a user by ID, revalidates and redirects.
 */
export async function deleteUserAction(id: string): Promise<FormResult<never>> {
  try {
    const db = getAppDb();
    const service = createUserService(db);

    const result = await service.deleteUser(toUserId(id));

    if (result.ok) {
      revalidatePath(ROUTES.dashboard.users);
      redirect(ROUTES.dashboard.users);
    }

    return formError<"_root">({
      fieldErrors: {
        _root: [
          result.error.message || USER_ERROR_MESSAGES.notFoundOrDeleteFailed,
        ],
      },
      message: USER_ERROR_MESSAGES.notFoundOrDeleteFailed,
    });
  } catch (_error: unknown) {
    return formError<"_root">({
      fieldErrors: { _root: [USER_ERROR_MESSAGES.unexpected] },
      message: USER_ERROR_MESSAGES.unexpected,
    });
  }
}
