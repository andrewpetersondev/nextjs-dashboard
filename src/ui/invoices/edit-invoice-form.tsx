"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import type { CustomerField } from "@/src/lib/definitions/customers.ts";
import type { EditInvoiceFormState } from "@/src/lib/definitions/invoices.ts";
import type { InvoiceDTO } from "@/src/lib/dto/invoice.dto.ts";
import { updateInvoiceAction } from "@/src/lib/server-actions/invoices.ts";
import { FormActionRow } from "@/src/ui/components/form-action-row.tsx";
import { FormSubmitButton } from "@/src/ui/components/form-submit-button.tsx";
import { Label } from "@/src/ui/components/label.tsx";
import { CustomerSelect } from "@/src/ui/invoices/customer-select.tsx";
import { InvoiceAmountInput } from "@/src/ui/invoices/invoice-amount-input.tsx";
import { InvoiceStatusRadioGroup } from "@/src/ui/invoices/invoice-status-radio-group.tsx";
import { ServerMessage } from "@/src/ui/users/server-message.tsx";

/**
 * Maps UpdateInvoiceResult to EditInvoiceFormState for useActionState.
 * Ensures the state shape always includes the latest invoice.
 */
function toEditInvoiceFormState(
	prevState: EditInvoiceFormState,
	result: Awaited<ReturnType<typeof updateInvoiceAction>>,
): EditInvoiceFormState {
	return {
		errors: result.errors,
		invoice: result.data ?? prevState.invoice, // Always provide invoice
		message: result.message,
		success: result.success,
	};
}

export function EditInvoiceForm({
	invoice,
	customers,
}: {
	invoice: InvoiceDTO;
	customers: CustomerField[];
}): JSX.Element {
	// Initial state matches EditInvoiceFormState
	const initialState: EditInvoiceFormState = {
		errors: {},
		invoice,
		message: "",
		success: undefined,
	};

	// Bind the invoice ID to the action
	const updateInvoiceWithId = updateInvoiceAction.bind(null, invoice.id);

	// useActionState expects a reducer: (prevState, payload) => newState
	const [state, formAction, isPending] = useActionState<
		EditInvoiceFormState,
		FormData
	>(async (prevState, formData) => {
		// Call the server action
		const result = await updateInvoiceWithId(prevState, formData);
		// Map the result to the expected state shape
		return toEditInvoiceFormState(prevState, result);
	}, initialState);

	const [showAlert, setShowAlert] = useState(false);

	useEffect(() => {
		if (state.message) {
			setShowAlert(true);
			const timer = setTimeout(() => setShowAlert(false), 4000);
			return () => clearTimeout(timer);
		}
		setShowAlert(false);
	}, [state.message]);

	return (
		<div>
			<form action={formAction}>
				<div className="bg-bg-secondary rounded-md p-4 md:p-6">
					{/* Customer */}
					<div className="mb-4">
						<Label htmlFor="customer" text="Choose customer" />
						<CustomerSelect
							customers={customers}
							dataCy="customer-select"
							defaultValue={state.invoice.customerId}
							disabled={isPending}
						/>
					</div>

					{/* Amount */}
					<InvoiceAmountInput
						dataCy="amount-input"
						defaultValue={state.invoice.amount / 100}
						disabled={isPending}
						error={state.errors?.amount}
						id="amount"
						label="Choose an amount"
						name="amount"
					/>

					{/* Invoice Status */}
					<InvoiceStatusRadioGroup
						data-cy="status-radio"
						disabled={isPending}
						error={state.errors?.status}
						name="status"
						value={state.invoice.status}
					/>
				</div>

				<FormActionRow cancelHref="/dashboard/invoices">
					<FormSubmitButton data-cy="edit-invoice-submit-button" pending={isPending}>
						Edit Invoice
					</FormSubmitButton>
				</FormActionRow>
			</form>
			<ServerMessage showAlert={showAlert} state={state} />
		</div>
	);
}
