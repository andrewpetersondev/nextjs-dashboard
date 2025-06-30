"use client";

import {
	CheckIcon,
	ClockIcon,
	CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { type JSX, useActionState } from "react";
import type { InvoiceEntity } from "@/src/lib/db/entities/invoice.ts";
import type { CustomerField } from "@/src/lib/definitions/customers.ts";
import type { InvoiceFormState } from "@/src/lib/definitions/invoices.ts";
import { updateInvoice } from "@/src/lib/server-actions/invoices.ts";
import { FieldError } from "@/src/ui/auth/field-error.tsx";
import { FormActionRow } from "@/src/ui/components/form-action-row.tsx";
import { FormSubmitButton } from "@/src/ui/components/form-submit-button.tsx";
import { DollarInput } from "@/src/ui/components/input.tsx";
import { Label } from "@/src/ui/components/label.tsx";
import { CustomerSelect } from "@/src/ui/invoices/customer-select.tsx";

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
				<div className="mb-4">
					<Label htmlFor="amount" text="Choose an amount" />
					<div className="relative mt-2 rounded-md">
						<div className="relative">
							<DollarInput
								ariaDescribedBy="customer-error"
								className=""
								dataCy="amount-input"
								defaultValue={invoice.amount}
								id="amount"
								name="amount"
								placeholder="Enter USD amount"
								step=".01"
								type="number"
							/>
							<CurrencyDollarIcon className="text-text-primary peer-focus:text-text-focus pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2" />
						</div>
					</div>
					{/* TODO: The form loads with Amount Error showing on page load */}
					<div
						aria-atomic="true"
						aria-live="polite"
						className="text=text-error mt-2 text-sm"
						id="customer-error"
					>
						<FieldError
							dataCy="amount-error"
							error={state.errors?.amount}
							id="amount-error"
							label="Amount error"
						/>
					</div>
				</div>

				{/* Invoice Status */}
				<fieldset>
					<legend className="mb-2 block text-sm font-medium">
						Set the invoice status
					</legend>
					<div className="border-bg-accent rounded-md border px-[14px] py-3">
						<div className="flex gap-4">
							<div className="flex items-center">
								<input
									className="border-bg-primary bg-bg-accent text-text-primary h-4 w-4 cursor-pointer focus:ring-2"
									defaultChecked={invoice.status === "pending"}
									id="pending"
									name="status"
									type="radio"
									value="pending"
								/>
								<label
									className="bg-bg-accent text-text-primary ml-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
									htmlFor="pending"
								>
									Pending <ClockIcon className="h-4 w-4" />
								</label>
							</div>
							<div className="flex items-center">
								<input
									className="border-bg-primary bg-bg-accent text-text-primary h-4 w-4 cursor-pointer focus:ring-2"
									defaultChecked={invoice.status === "paid"}
									id="paid"
									name="status"
									type="radio"
									value="paid"
								/>
								<label
									className="bg-bg-accent text-text-primary ml-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
									htmlFor="paid"
								>
									Paid <CheckIcon className="h-4 w-4" />
								</label>
							</div>
						</div>
					</div>
				</fieldset>
			</div>

			<FormActionRow cancelHref="/dashboard/invoices">
				<FormSubmitButton data-cy="edit-invoice-submit-button" pending={isPending}>
					Edit Invoice
				</FormSubmitButton>
			</FormActionRow>
		</form>
	);
}
