// "use server";
//
// import { db } from "@/src/db/database";
// import { invoices } from "@/src/db/schema";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { InvoiceFormSchema, InvoiceState } from "@/types/definitions";
//
// const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });
//
// export async function createInvoice(
//   prevState: InvoiceState,
//   formData: FormData,
// ) {
//   const validatedFields = CreateInvoice.safeParse({
//     customerId: formData.get("customerId"),
//     amount: formData.get("amount"),
//     status: formData.get("status"),
//   });
//
//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//       message: "Missing Fields. Failed to Create Invoice.",
//     };
//   }
//   const { customerId, amount, status } = validatedFields.data;
//   const amountInCents = amount * 100;
//   const date = new Date().toISOString().split("T")[0];
//   try {
//     await db.insert(invoices).values({
//       customerId: customerId,
//       amount: amountInCents,
//       status: status,
//       date: date,
//     });
//   } catch (e) {
//     console.error(e);
//     return {
//       message: "Database Error. Failed to Create Invoice.",
//     };
//   }
//   revalidatePath("/dashboard/invoices");
//   redirect("/dashboard/invoices");
// }