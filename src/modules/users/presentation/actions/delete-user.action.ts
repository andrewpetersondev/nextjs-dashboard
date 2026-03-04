"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { USER_ERROR_MESSAGES } from "@/modules/users/domain/constants/user.constants";
import { toUserId } from "@/modules/users/domain/user-id.mappers";
import { createUserService } from "@/modules/users/infrastructure/factories/user-service.factory";
import { getAppDb } from "@/server/db/db.connection";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeFormError } from "@/shared/forms/logic/factories/form-result.factory";
import { ROUTES } from "@/shared/routing/routes";

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
