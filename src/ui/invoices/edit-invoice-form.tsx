"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import type { CustomerField } from "@/src/lib/definitions/customers.types";
import type { InvoiceEditState } from "@/src/lib/definitions/invoices.types";
import type { InvoiceDto } from "@/src/lib/dto/invoice.dto";
import { updateInvoiceAction } from "@/src/lib/server-actions/invoices.actions";
import { FormActionRow } from "@/src/ui/components/form-action-row";
import { FormSubmitButton } from "@/src/ui/components/form-submit-button";
import { Label } from "@/src/ui/components/label";
import { CustomerSelect } from "@/src/ui/invoices/customer-select";
import { InvoiceAmountInput } from "@/src/ui/invoices/invoice-amount-input";
import { InvoiceStatusRadioGroup } from "@/src/ui/invoices/invoice-status-radio-group";
import { ServerMessage } from "@/src/ui/users/server-message";

export function EditInvoiceForm({
	invoice,
	customers,
}: {
	invoice: InvoiceDto;
	customers: CustomerField[];
}): JSX.Element {
	// Initial state matches InvoiceEditState
	const initialState: InvoiceEditState = {
		errors: {},
		invoice,
		message: "",
		success: undefined,
	};

	// Bind the invoice ID to the action
	const updateInvoiceWithId = updateInvoiceAction.bind(null, invoice.id);

	// useActionState expects a reducer: (prevState, payload) => newState
	const [state, formAction, isPending] = useActionState<
		InvoiceEditState,
		FormData
	>(async (prevState, formData) => {
		// Call the server action
		return await updateInvoiceWithId(prevState, formData);
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
					<FormSubmitButton
						data-cy="edit-invoice-submit-button"
						pending={isPending}
					>
						Edit Invoice
					</FormSubmitButton>
				</FormActionRow>
			</form>
			<ServerMessage showAlert={showAlert} state={state} />
		</div>
	);
}
