"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUserService } from "@/modules/users/application/services/factories/user-service.factory";
import { USER_ERROR_MESSAGES } from "@/modules/users/domain/user.messages";
import { getAppDb } from "@/server/db/db.connection";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";
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

    return makeFormError<"_root">({
      fieldErrors: {
        _root: [
          result.error.message || USER_ERROR_MESSAGES.notFoundOrDeleteFailed,
        ],
      },
      formData: {} as Readonly<Partial<Record<"_root", string>>>,
      formErrors: [],
      key: APP_ERROR_KEYS.not_found,
      message: USER_ERROR_MESSAGES.notFoundOrDeleteFailed,
    });
  } catch (_error: unknown) {
    return makeFormError<"_root">({
      fieldErrors: { _root: [USER_ERROR_MESSAGES.unexpected] },
      formData: {} as Readonly<Partial<Record<"_root", string>>>,
      formErrors: [],
      key: APP_ERROR_KEYS.unexpected,
      message: USER_ERROR_MESSAGES.unexpected,
    });
  }
}
