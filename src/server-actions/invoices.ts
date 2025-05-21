"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { InvoiceFormSchema, type InvoiceState } from "@/lib/definitions";
import { eq } from "drizzle-orm";
import { db } from "@/db/database";
import { invoices } from "@/db/schema";

const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

export async function createInvoice(
  prevState: InvoiceState,
  formData: FormData,
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];
  try {
    await db.insert(invoices).values({
      customerId: customerId,
      amount: amountInCents,
      status: status,
      date: date,
    });
  } catch (e) {
    console.error(e);
    return {
      message: "Database Error. Failed to Create Invoice.",
    };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: InvoiceState,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  try {
    await db
      .update(invoices)
      .set({
        customerId: customerId,
        amount: amountInCents,
        status: status,
      })
      .where(eq(invoices.id, id));
  } catch (e) {
    console.error(e);
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await db.delete(invoices).where(eq(invoices.id, id));
  } catch (e) {
    console.error(e);
  }
  revalidatePath("/dashboard/invoices");
}
