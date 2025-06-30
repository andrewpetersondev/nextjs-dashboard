import "server-only";

import { eq } from "drizzle-orm";
import type { Db } from "@/src/lib/db/connection.ts";
import { customers, invoices } from "@/src/lib/db/schema.ts";

/**
 * Data structure for dashboard cards.
 */
export interface CardData {
	invoiceCount: number;
	customerCount: number;
	paidInvoices: number;
	pendingInvoices: number;
}

export async function fetchCardData(db: Db): Promise<CardData> {
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
