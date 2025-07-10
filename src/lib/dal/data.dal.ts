import "server-only";

import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/connection";
import { customers, invoices } from "@/lib/db/schema";
import type { CardData } from "@/lib/definitions/data.types";

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
