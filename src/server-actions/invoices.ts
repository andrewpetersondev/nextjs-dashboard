"use server";

import { createInvoiceInDB } from "@/src/dal/invoices";
import { getDB } from "@/src/db/connection";
import { db } from "@/src/db/dev-database";
import { invoices } from "@/src/db/schema";
import {
	type CreateInvoiceResult,
	CreateInvoiceSchema,
	type CustomerId,
	type InvoiceFormState,
	UpdateInvoiceSchema,
} from "@/src/lib/definitions/invoices";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Creates a new invoice in the database.
 * - Validates and brands input.
 * - Handles errors and returns a consistent result shape for UI.
 *
 * @param _prevState - Previous form state (for React API compatibility).
 * @param formData - FormData containing invoice fields.
 * @returns A promise resolving to a CreateInvoiceResult.
 */
export async function createInvoice(
	_prevState: CreateInvoiceResult,
	formData: FormData,
): Promise<CreateInvoiceResult> {
	try {
		const db = getDB();
		const validated = CreateInvoiceSchema.safeParse({
			customerId: formData.get("customerId"),
			amount: formData.get("amount"),
			status: formData.get("status"),
		});

		if (!validated.success) {
			return {
				errors: validated.error.flatten().fieldErrors,
				message: "Missing Fields. Failed to Create InvoiceEntity.",
				success: false,
			};
		}

		// Correctly brand customerId for type safety
		const customerId = validated.data.customerId as unknown as CustomerId;

		const amount = validated.data.amount;

		const status = validated.data.status;

		const amountInCents: number = amount * 100;

		const date: string = new Date().toISOString().split("T")[0];

		const invoice = await createInvoiceInDB(db, {
			customerId,
			amount: amountInCents,
			status,
			date,
		});

		// todo: implement { ActionResult}
		if (!invoice) {
			return {
				message: "Failed to create invoice.",
				success: false,
				errors: {},
			};
		}
	} catch (error) {
		console.error(error);
		return {
			errors: {},
			message: "Database Error. Failed to Create InvoiceEntity.",
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
			message: "Missing Fields. Failed to Update InvoiceEntity.",
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
		return { message: "Database Error: Failed to Update InvoiceEntity." };
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
