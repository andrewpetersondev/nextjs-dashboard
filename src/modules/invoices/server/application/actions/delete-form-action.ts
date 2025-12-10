"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteInvoiceAction } from "@/modules/invoices/server/application/actions/delete-user.action";

/**
 * Form server action for deleting an invoice.
 * @param formData - The form data containing the invoice ID
 * @returns A promise that resolves when the action completes
 */
export async function deleteInvoiceFormAction(
  formData: FormData,
): Promise<void> {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string") {
    throw new Error("Invalid invoice ID");
  }
  await deleteInvoiceAction(id);
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
