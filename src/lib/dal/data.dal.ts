import "server-only";

import { eq } from "drizzle-orm";
// todo: all code that touches the database directly should be moved to DAL
import type { DB } from "@/src/lib/db/connection";
import { customers, invoices } from "@/src/lib/db/schema";

export async function fetchCardData(db: DB): Promise<{
	invoiceCount: number;
	customerCount: number;
	paidInvoices: number;
	pendingInvoices: number;
}> {
	try {
		const invoiceCount: number = await db.$count(invoices);
		const customerCount: number = await db.$count(customers);
		const paidInvoices: number = await db.$count(
			invoices,
			eq(invoices.status, "paid"),
		);
		const pendingInvoices: number = await db.$count(
			invoices,
			eq(invoices.status, "pending"),
		);
		return {
			customerCount,
			invoiceCount,
			paidInvoices,
			pendingInvoices,
		};
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch card data.");
	}
}
