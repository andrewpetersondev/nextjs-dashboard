"use server";

import { z } from "zod";
import { db } from "@/src/db/database";
import { invoices } from "@/src/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  await db.insert(invoices).values({
    customer_id: customerId,
    amount: amountInCents,
    paymentStatus: status,
    date: date,
  });

  revalidatePath("/dashboard/invoices");
  redirect('/dashboard/invoices');
}