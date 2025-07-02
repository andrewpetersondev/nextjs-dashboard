"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import type { CustomerField } from "@/src/lib/definitions/customers.ts";
import type { InvoiceDTO } from "@/src/lib/dto/invoice.dto.ts";
import { updateInvoiceAction } from "@/src/lib/server-actions/invoices.ts";
import { FormActionRow } from "@/src/ui/components/form-action-row.tsx";
import { FormSubmitButton } from "@/src/ui/components/form-submit-button.tsx";
import { Label } from "@/src/ui/components/label.tsx";
import { CustomerSelect } from "@/src/ui/invoices/customer-select.tsx";
import { InvoiceAmountInput } from "@/src/ui/invoices/invoice-amount-input.tsx";
import { InvoiceStatusRadioGroup } from "@/src/ui/invoices/invoice-status-radio-group.tsx";
import { ServerMessage } from "@/src/ui/users/server-message.tsx";

type EditInvoiceFormState = Readonly<{
	invoice: InvoiceDTO;
	errors?: {
		amount?: string[];
		customerId?: string[];
		status?: string[];
	};
	message?: string;
	success?: boolean;
}>;

// TODO: Form does not update when submitted like the Edit User Form does. Correction, Edit User Form does not update.
export function EditInvoiceForm({
	invoice,
	customers,
}: {
	invoice: InvoiceDTO;
	customers: CustomerField[];
}): JSX.Element {
	const initialState: EditInvoiceFormState = {
		errors: {},
		invoice,
		message: "",
		success: undefined,
	};

	const updateInvoiceWithId = updateInvoiceAction.bind(null, invoice.id);

	const [state, formAction, isPending] = useActionState<
		EditInvoiceFormState,
		FormData
	>(updateInvoiceWithId, initialState);

	const [showAlert, setShowAlert] = useState(false);

	useEffect(() => {
		if (state.message) {
			setShowAlert(true);
			const timer = setTimeout(() => setShowAlert(false), 4000); // 4 seconds
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
							defaultValue={invoice.customerId}
							disabled={isPending}
						/>
					</div>

					{/* Amount */}
					<InvoiceAmountInput
						dataCy="amount-input"
						defaultValue={invoice.amount / 100} // show dollars
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
						value={invoice.status}
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
