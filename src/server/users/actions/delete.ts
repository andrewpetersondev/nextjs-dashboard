"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { USER_ERROR_MESSAGES } from "@/features/users/messages";
import { getDB } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { deleteUserDal } from "@/server/users/dal/delete";
import {
  type ActionResult,
  actionResult,
} from "@/shared/action-result/action-result";
import { toUserId } from "@/shared/brands/domain-brands";

/**
 * Deletes a user by ID, revalidates and redirects.
 */
export async function deleteUserAction(userId: string): Promise<ActionResult> {
  try {
    const db = getDB();
    const deletedUser = await deleteUserDal(db, toUserId(userId));
    if (!deletedUser) {
      return actionResult({
        errors: { _root: ["User not found or delete failed"] },
        message: USER_ERROR_MESSAGES.NOT_FOUND_OR_DELETE_FAILED,
        success: false,
      });
    }
    revalidatePath("/dashboard/users");
    redirect("/dashboard/users");
  } catch (error) {
    serverLogger.error({
      context: "deleteUserAction",
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      userId,
    });
    return actionResult({
      errors: { _root: ["User delete unsuccessful"] },
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    });
  }
}
