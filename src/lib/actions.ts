"use server";

import { z } from "zod";
import { db } from "@/src/db/database";
import { invoices } from "@/src/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
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
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
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