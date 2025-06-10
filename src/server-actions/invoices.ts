"use server";

import { db } from "@/src/db/database";
import { invoices } from "@/src/db/schema";
import {
	type CreateInvoiceResult,
	CreateInvoiceSchema,
	type InvoiceFormState,
	UpdateInvoiceSchema,
} from "@/src/lib/definitions/invoices";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Create a new invoice.
 * - Returns consistent result shape for UI.
 * - Only uses _prevState for React API compatibility.
 */
export async function createInvoice(
	_prevState: CreateInvoiceResult,
	formData: FormData,
): Promise<CreateInvoiceResult> {
	const validated = CreateInvoiceSchema.safeParse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	if (!validated.success) {
		return {
			errors: validated.error.flatten().fieldErrors,
			message: "Missing Fields. Failed to Create Invoice.",
			success: false,
		};
	}

	const { customerId, amount, status } = validated.data;
	const amountInCents: number = amount * 100;
	const date: string = new Date().toISOString().split("T")[0];
	try {
		await db.insert(invoices).values({
			customerId,
			amount: amountInCents,
			status,
			date,
		});
	} catch (e) {
		console.error(e);
		return {
			errors: {},
			message: "Database Error. Failed to Create Invoice.",
			success: false,
		};
	}
	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

/**
 * Update an existing invoice.
 * - Returns consistent result shape for UI.
 * - Only uses _prevState for React API compatibility.
 */
export async function updateInvoice(
	id: string,
	_prevState: InvoiceFormState,
	formData: FormData,
): Promise<InvoiceFormState> {
	const validated = UpdateInvoiceSchema.safeParse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	if (!validated.success) {
		return {
			errors: validated.error.flatten().fieldErrors,
			message: "Missing Fields. Failed to Update Invoice.",
		};
	}

	const { customerId, amount, status } = validated.data;
	const amountInCents = amount * 100;
	try {
		await db
			.update(invoices)
			.set({
				customerId,
				amount: amountInCents,
				status,
			})
			.where(eq(invoices.id, id));
	} catch (e) {
		console.error(e);
		return { message: "Database Error: Failed to Update Invoice." };
	}

	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

/**
 * Delete an invoice by ID.
 * - No return value, but logs errors.
 */
export async function deleteInvoice(id: string): Promise<void> {
	try {
		await db.delete(invoices).where(eq(invoices.id, id));
	} catch (e) {
		console.error(e);
	}
	revalidatePath("/dashboard/invoices");
}
