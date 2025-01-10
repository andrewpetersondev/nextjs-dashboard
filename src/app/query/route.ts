import { db } from "@/src/db/database";
import { invoices, customers } from "@/src/db/schema";
import { eq } from "drizzle-orm/";

async function listInvoices() {
  const data = await db
    .select({ amount: invoices.amount, customerName: customers.name })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customer_id, customers.id))
    .where(eq(invoices.amount, 1000));
  return data;
}

export async function GET() {
  try {
    const invoiceData = await listInvoices();
    return new Response(JSON.stringify({ invoices: invoiceData }), {
      status: 200,
    });
    // return Response.json(await listInvoices());
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch invoices" }), {
      status: 500,
    });
    // return Response.json({ error }, { status: 500 });
  }
}