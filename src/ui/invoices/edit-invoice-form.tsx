"use client";

import { type JSX, useActionState } from "react";
import type { InvoiceEntity } from "@/src/lib/db/entities/invoice.ts";
import type { CustomerField } from "@/src/lib/definitions/customers.ts";
import type { InvoiceFormState } from "@/src/lib/definitions/invoices.ts";
import { updateInvoice } from "@/src/lib/server-actions/invoices.ts";
import { FormActionRow } from "@/src/ui/components/form-action-row.tsx";
import { FormSubmitButton } from "@/src/ui/components/form-submit-button.tsx";
import { Label } from "@/src/ui/components/label.tsx";
import { CustomerSelect } from "@/src/ui/invoices/customer-select.tsx";
import { InvoiceAmountInput } from "@/src/ui/invoices/invoice-amount-input.tsx";
import { InvoiceStatusRadioGroup } from "@/src/ui/invoices/invoice-status-radio-group.tsx";

export function EditInvoiceForm({
	invoice,
	customers,
}: {
	invoice: InvoiceEntity;
	customers: CustomerField[];
}): JSX.Element {
	const initialState: InvoiceFormState = { errors: {}, message: "" };
	const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
	const [state, formAction, isPending] = useActionState(
		updateInvoiceWithId,
		initialState,
	);
	return (
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
					defaultValue={invoice.amount}
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
	);
}
