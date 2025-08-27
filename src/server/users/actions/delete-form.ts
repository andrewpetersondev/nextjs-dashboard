"use server";

import { deleteUserAction } from "@/server/users/actions/delete";

/**
 * Deletes a user by ID from FormData.
 */
export async function deleteUserFormAction(formData: FormData): Promise<void> {
  "use server";
  // TODO: WHEN DID ID GET IN THE FORM?
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    // Invalid userId; nothing to do.
    return;
  }
  await deleteUserAction(id);
}
