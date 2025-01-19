import { db } from "@/db/database";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteInvoice(id: string) {
  try {
    await db.delete(invoices).where(eq(invoices.id, id));
  } catch (e) {
    console.error(e);
  }
  revalidatePath("/dashboard/invoices");
}