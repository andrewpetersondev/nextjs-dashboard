"use server";

import { deleteUserAction } from "@/server/users/actions/delete";

/**
 * Deletes a user by ID from FormData.
 */
export async function deleteUserFormAction(formData: FormData): Promise<void> {
  "use server";
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) {
    // Invalid userId; nothing to do.
    return;
  }
  await deleteUserAction(userId);
}
