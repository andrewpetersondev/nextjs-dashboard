"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	createInvoiceInDB,
	deleteInvoiceInDB,
	updateInvoiceInDB,
} from "@/src/lib/dal/invoices.dal";
import { getDB } from "@/src/lib/db/connection";
import {
	type CreateInvoiceResult,
	CreateInvoiceSchema,
	type CustomerId,
	type InvoiceFormState,
	UpdateInvoiceSchema,
} from "@/src/lib/definitions/invoices";
import type { InvoiceDTO } from "@/src/lib/dto/invoice.dto";
import { toInvoiceId } from "@/src/lib/mappers/invoice.mapper";

// todo: unify the return types of these actions

/**
 * Server action to create a new invoice.
 * Validates input, delegates to DAL, and handles navigation.
 * @param _prevState - Previous form state (for React compatibility).
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
			amount: formData.get("amount"),
			customerId: formData.get("customerId"),
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
			amount: amountInCents,
			customerId,
			date,
			status,
		});

		// todo: implement { ActionResult}
		if (!invoice) {
			return {
				errors: {},
				message: "Failed to create invoice.",
				success: false,
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
 * Server action to update an existing invoice.
 * Validates input, delegates to DAL, and handles navigation.
 * @param id - The invoice ID as a string.
 * @param _prevState - Previous form state (for React compatibility).
 * @param formData - FormData containing invoice fields.
 * @returns A promise resolving to an InvoiceFormState.
 */
export async function updateInvoice(
	id: string,
	_prevState: InvoiceFormState,
	formData: FormData,
): Promise<InvoiceFormState> {
	const db = getDB();

	const validated = UpdateInvoiceSchema.safeParse({
		amount: formData.get("amount"),
		customerId: formData.get("customerId"),
		status: formData.get("status"),
	});

	if (!validated.success) {
		return {
			errors: validated.error.flatten().fieldErrors,
			message: "Missing Fields. Failed to Update InvoiceEntity.",
		};
	}

	// Brand customerId for type safety
	const customerId = validated.data.customerId as unknown as CustomerId;
	const amount = validated.data.amount;
	const status = validated.data.status;
	const amountInCents = amount * 100;

	try {
		const updatedInvoice = await updateInvoiceInDB(db, id, {
			amount: amountInCents,
			customerId,
			status,
		});

		if (!updatedInvoice) {
			return {
				// success: false, // unify response shape
				errors: {},
				message: "Failed to update invoice.",
			};
		}
	} catch (error) {
		console.error(error);
		return { message: "Database Error: Failed to Update InvoiceEntity." };
	}

	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

/**
 * Programmatic server action to delete an invoice by string ID.
 * @param id - The invoice ID as a string.
 * @returns The deleted InvoiceDTO or null.
 */
export async function deleteInvoiceAction(
	id: string,
): Promise<InvoiceDTO | null> {
	const db = getDB();
	return await deleteInvoiceInDB(db, toInvoiceId(id));
}

/**
 * Form server action for deleting an invoice.
 * Accepts FormData, extracts and brands the ID, and handles navigation.
 * @param formData - The form data containing the invoice ID.
 * @returns A promise that resolves when the action completes.
 */
export async function deleteInvoiceFormAction(
	formData: FormData,
): Promise<void> {
	"use server";
	const id = formData.get("id");
	if (typeof id !== "string") {
		throw new Error("Invalid invoice ID");
	}
	await deleteInvoiceAction(id);
	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}
