"use client";

import { type JSX, useActionState, useEffect, useState } from "react";
import { createInvoiceAction } from "@/src/lib/actions/invoices.actions";
import type { CustomerField } from "@/src/lib/definitions/customers.types";
import type { InvoiceCreateState } from "@/src/lib/definitions/invoices.types";
import { FormActionRow } from "@/src/ui/components/form-action-row";
import { FormSubmitButton } from "@/src/ui/components/form-submit-button";
import { Label } from "@/src/ui/components/label";
import { CustomerSelect } from "@/src/ui/invoices/customer-select";
import { InvoiceAmountInput } from "@/src/ui/invoices/invoice-amount-input";
import { InvoiceServerMessage } from "@/src/ui/invoices/invoice-server-message";
import { InvoiceStatusRadioGroup } from "@/src/ui/invoices/invoice-status-radio-group";

export const CreateInvoiceForm = ({
	customers,
}: {
	customers: CustomerField[];
}): JSX.Element => {
	// Initial state matches InvoiceCreateState
	const initialState: InvoiceCreateState = {
		errors: {},
		message: "",
		success: false, // false vs undefined??
	};
	const [state, action, isPending] = useActionState(
		createInvoiceAction,
		initialState,
	);
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
		<section>
			<form action={action}>
				<div className="bg-bg-secondary rounded-md p-4 md:p-6">
					<div className="mb-4">
						<Label htmlFor="customer" text="Choose customer" />
						<CustomerSelect
							customers={customers}
							dataCy="customer-select"
							defaultValue=""
							disabled={isPending}
							error={state.errors?.customerId}
						/>
					</div>
					<InvoiceAmountInput
						dataCy="amount-input"
						disabled={isPending}
						error={state.errors?.amount}
						id="amount"
						label="Choose an amount"
						name="amount"
						placeholder="Enter USD amount"
						step="0.01"
						type="number"
					/>
					<InvoiceStatusRadioGroup
						data-cy="status-radio"
						disabled={isPending}
						error={state.errors?.status}
						name="status"
						value="pending" // Default to "pending"
					/>
				</div>
				<FormActionRow cancelHref="/dashboard/invoices">
					<FormSubmitButton
						data-cy="create-invoice-submit-button"
						pending={isPending}
					>
						Create Invoice
					</FormSubmitButton>
				</FormActionRow>
			</form>
			<InvoiceServerMessage showAlert={showAlert} state={state} />
		</section>
	);
};
