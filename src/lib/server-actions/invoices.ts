"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	createInvoiceDal,
	deleteInvoiceDal,
	readInvoiceDal,
	updateInvoiceDal,
} from "@/src/lib/dal/invoices.dal.ts";
import { getDB } from "@/src/lib/db/connection.ts";
import type { InvoiceEditState } from "@/src/lib/definitions/invoices.ts";
import {
	type CreateInvoiceResult,
	CreateInvoiceSchema,
	UpdateInvoiceSchema,
} from "@/src/lib/definitions/invoices.ts";
import type { InvoiceDTO } from "@/src/lib/dto/invoice.dto.ts";
import {
	toCustomerIdBrand,
	toInvoiceIdBrand,
	toInvoiceStatusBrand,
} from "@/src/lib/mappers/invoice.mapper.ts";
import {
	getFormField,
	invoiceActionResult,
} from "@/src/lib/utils/utils.server.ts";

/**
 * Server action to create a new invoice.
 * @param _prevState - Previous form state.
 * @param formData - FormData containing invoice fields.
 * @returns A promise resolving to a CreateInvoiceResult.
 */
export async function createInvoiceAction(
	_prevState: CreateInvoiceResult,
	formData: FormData,
): Promise<CreateInvoiceResult> {
	try {
		const db = getDB();

		// --- Strongly-typed field extraction ---
		let rawAmount: string;
		let rawCustomerId: string;
		let rawStatus: string;
		try {
			rawAmount = getFormField(formData, "amount");
			rawCustomerId = getFormField(formData, "customerId");
			rawStatus = getFormField(formData, "status");
		} catch (err) {
			console.error(err);
			return invoiceActionResult({
				errors: {
					amount: formData.get("amount") ? undefined : ["Amount is required."],
					customerId: formData.get("customerId")
						? undefined
						: ["Customer ID is required."],
					status: formData.get("status") ? undefined : ["Status is required."],
				},
				message: "Missing required fields.",
				success: false,
			});
		}

		// --- Zod validation ---
		const validated = CreateInvoiceSchema.safeParse({
			amount: rawAmount,
			customerId: rawCustomerId,
			status: rawStatus,
		});

		if (!validated.success) {
			return invoiceActionResult({
				errors: validated.error.flatten().fieldErrors,
				message: "Invalid input. Failed to create invoice.",
				success: false,
			});
		}

		// --- Type-safe transformation ---
		const { amount, customerId, status } = validated.data;
		const brandedCustomerId = toCustomerIdBrand(customerId);
		const brandedStatus = toInvoiceStatusBrand(status);
		const amountInCents = Math.round(amount * 100); // Avoid floating point issues
		const date = new Date().toISOString().split("T")[0];

		// --- DAL call ---
		const insert = {
			amount: amountInCents,
			customerId: brandedCustomerId,
			date,
			status: brandedStatus,
		};

		const invoice = await createInvoiceDal(db, insert);

		if (!invoice) {
			return invoiceActionResult({
				errors: undefined,
				message: "Failed to create invoice.",
				success: false,
			});
		}

		return invoiceActionResult({
			errors: undefined,
			message: "Invoice created successfully.",
			success: true,
		});
	} catch (error) {
		// Use structured logging in production
		console.error(error);
		return invoiceActionResult({
			errors: {},
			message: "Database Error. Failed to create invoice.",
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
export async function readInvoiceAction(
	id: string,
): Promise<InvoiceDTO | null> {
	try {
		const db = getDB();
		const brandedId = toInvoiceIdBrand(id);
		const invoice = await readInvoiceDal(db, brandedId);

		return invoice ? invoice : null;
	} catch (error) {
		console.error(error);
		throw new Error("Database Error: Failed to Fetch InvoiceEntity.");
	}
}

/**
 * Server action to update an existing invoice.
 * @param id - The invoice ID as a string.
 * @param prevState - Previous form state.
 * @param formData - FormData containing invoice fields.
 * @returns A promise resolving to an UpdateInvoiceResult.
 */
export async function updateInvoiceAction(
	id: string,
	prevState: InvoiceEditState,
	formData: FormData,
): Promise<InvoiceEditState> {
	try {
		const db = getDB();

		let rawAmount: string;
		let rawCustomerId: string;
		let rawStatus: string;
		try {
			rawAmount = getFormField(formData, "amount");
			rawCustomerId = getFormField(formData, "customerId");
			rawStatus = getFormField(formData, "status");
		} catch {
			return {
				errors: {
					amount: formData.get("amount") ? undefined : ["Amount is required."],
					customerId: formData.get("customerId")
						? undefined
						: ["Customer ID is required."],
					status: formData.get("status") ? undefined : ["Status is required."],
				}, // Always provide invoice for UI
				invoice: prevState.invoice,
				message: "Missing required fields.",
				success: false,
			};
		}

		const validated = UpdateInvoiceSchema.safeParse({
			amount: rawAmount,
			customerId: rawCustomerId,
			status: rawStatus,
		});

		if (!validated.success) {
			return {
				errors: validated.error.flatten().fieldErrors,
				invoice: prevState.invoice,
				message: "Invalid input. Failed to update invoice.",
				success: false,
			};
		}

		const { amount, customerId, status } = validated.data;
		const brandedId = toInvoiceIdBrand(id);
		const brandedCustomerId = toCustomerIdBrand(customerId);
		const brandedStatus = toInvoiceStatusBrand(status);
		const amountInCents = Math.round(amount * 100);

		const updatedInvoice = await updateInvoiceDal(db, brandedId, {
			amount: amountInCents,
			customerId: brandedCustomerId,
			status: brandedStatus,
		});

		if (!updatedInvoice) {
			return {
				errors: undefined,
				invoice: prevState.invoice,
				message: "Failed to update invoice.",
				success: false,
			};
		}

		return {
			errors: undefined,
			invoice: updatedInvoice,
			message: "Updated invoice successfully.",
			success: true,
		};
	} catch (error) {
		console.error("[updateInvoiceAction]", error, { id });
		return {
			errors: {},
			invoice: prevState.invoice,
			message: "Database Error: Failed to update invoice.",
			success: false,
		};
	}
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
	return await deleteInvoiceDal(db, toInvoiceIdBrand(id));
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
