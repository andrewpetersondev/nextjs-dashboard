"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	createInvoiceInDb,
	deleteInvoiceInDb,
	fetchInvoiceById,
	updateInvoiceInDb,
} from "@/src/lib/dal/invoices.dal.ts";
import { getDB } from "@/src/lib/db/connection.ts";
import {
	type CreateInvoiceResult,
	CreateInvoiceSchema,
	type InvoiceFormState,
	UpdateInvoiceSchema,
} from "@/src/lib/definitions/invoices.ts";
import type { InvoiceDTO } from "@/src/lib/dto/invoice.dto.ts";
import {
	toCustomerIdBrand,
	toInvoiceIdBrand,
	toInvoiceStatusBrand,
} from "@/src/lib/mappers/invoice.mapper.ts";
import { actionResult } from "@/src/lib/utils/utils.server.ts";

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
			return actionResult({
				errors: validated.error.flatten().fieldErrors,
				message: "Missing Fields. Failed to Create InvoiceEntity.",
				success: false,
			});
		}

		// Correctly brand customerId for type safety
		const customerId = toCustomerIdBrand(validated.data.customerId);
		const amount = validated.data.amount;
		const status = toInvoiceStatusBrand(validated.data.status);
		const amountInCents: number = amount * 100;
		const date: string = new Date().toISOString().split("T")[0];

		const invoice = await createInvoiceInDb(db, {
			amount: amountInCents,
			customerId,
			date,
			status,
		});

		if (!invoice) {
			return actionResult({
				errors: undefined,
				message: "Failed to create invoice.",
				success: false,
			});
		}

		return actionResult({
			errors: undefined,
			message: "Invoice created successfully.",
			success: true,
		});
	} catch (error) {
		console.error(error);
		return actionResult({
			errors: {},
			message: "Database Error. Failed to Create InvoiceEntity.",
			success: false,
		});
	}
	// FIXME: returning actionResult on success made this unreachable.
	// revalidatePath("/dashboard/invoices");
	// redirect("/dashboard/invoices");
}

/**
 * Server action to fetch a single invoice by its ID.
 * @param id - The invoice ID (string).
 * @returns An InvoiceDTO, or null.
 */
export async function readInvoice(id: string) {
	try {
		const db = getDB();
		const brandedId = toInvoiceIdBrand(id);
		const invoice = await fetchInvoiceById(db, brandedId);

		return invoice ? invoice : null;
	} catch (error) {
		console.error(error);
		throw new Error("Database Error: Failed to Fetch InvoiceEntity.");
	}
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
		return actionResult({
			errors: validated.error.flatten().fieldErrors,
			message: "Missing Fields. Failed to Update InvoiceEntity.",
			success: false,
		});
	}

	// Brand customerId for type safety
	// TODO: Find pattern in other files, then replace with branding function. (ex. toCustomerIdBrand()).
	// old: const customerId = validated.data.customerId as unknown as CustomerId;
	const customerId = toCustomerIdBrand(validated.data.customerId);
	const amount: number = validated.data.amount;
	const status = toInvoiceStatusBrand(validated.data.status);
	const amountInCents: number = amount * 100;

	try {
		const updatedInvoice: InvoiceDTO | null = await updateInvoiceInDb(db, id, {
			amount: amountInCents,
			customerId,
			status,
		});

		if (!updatedInvoice) {
			return actionResult({
				errors: undefined,
				message: "Failed to update invoice.",
				success: false,
			});
		}

		return actionResult({
			errors: undefined,
			message: "Updated invoice successfully.",
			success: true,
		});
	} catch (error) {
		console.error(error);
		return actionResult({
			errors: {},
			message: "Database Error: Failed to Update InvoiceEntity.",
			success: false,
		});
	}

	// FIXME: returning actionResult on success made this unreachable.
	// revalidatePath("/dashboard/invoices");
	// redirect("/dashboard/invoices");
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
	return await deleteInvoiceInDb(db, toInvoiceIdBrand(id));
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
