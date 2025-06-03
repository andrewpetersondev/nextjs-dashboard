"use client";

import type { CustomerField } from "@/src/lib/definitions/customers";
import type { InvoiceForm, InvoiceState } from "@/src/lib/definitions/invoices";
import { updateInvoice } from "@/src/server-actions/invoices";
import { Button } from "@/src/ui/button";
import {
	CheckIcon,
	ClockIcon,
	CurrencyDollarIcon,
	UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useActionState } from "react";

export default function EditInvoiceForm({
	invoice,
	customers,
}: {
	invoice: InvoiceForm;
	customers: CustomerField[];
}) {
	const initialState: InvoiceState = { message: null, errors: {} };
	const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
	const [state, formAction] = useActionState(updateInvoiceWithId, initialState);
	return (
		<form action={formAction}>
			<div className="bg-bg-secondary rounded-md p-4 md:p-6">
				{/* Customer Name */}
				<div className="mb-4">
					<label htmlFor="customer" className="mb-2 block text-sm font-medium">
						Choose customer
					</label>
					<div className="relative">
						<select
							id="customer"
							name="customerId"
							className="peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
							defaultValue={invoice.customerId}
						>
							<option value="" disabled>
								Select a customer
							</option>
							{customers.map((customer) => (
								<option key={customer.id} value={customer.id}>
									{customer.name}
								</option>
							))}
						</select>
						<UserCircleIcon className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2" />
					</div>
				</div>

				{/* Invoice Amount */}
				<div className="mb-4">
					<label htmlFor="amount" className="mb-2 block text-sm font-medium">
						Choose an amount
					</label>
					<div className="relative mt-2 rounded-md">
						<div className="relative">
							<input
								id="amount"
								name="amount"
								type="number"
								step="0.01"
								defaultValue={invoice.amount}
								placeholder="Enter USD amount"
								className="peer border-bg-accent placeholder:text-text-primary block w-full rounded-md border py-2 pl-10 text-sm outline-2"
								aria-describedby="customer-error"
							/>
							<CurrencyDollarIcon className="text-text-primary peer-focus:text-text-focus pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2" />
						</div>
					</div>
					<div id="customer-error" aria-live="polite" aria-atomic="true">
						{state.errors?.amount?.map((error: string) => (
							<p className="text-text-error mt-2 text-sm" key={error}>
								{error}
							</p>
						))}
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
									id="pending"
									name="status"
									type="radio"
									value="pending"
									defaultChecked={invoice.status === "pending"}
									className="border-bg-primary bg-bg-accent text-text-primary h-4 w-4 cursor-pointer focus:ring-2"
								/>
								<label
									htmlFor="pending"
									className="bg-bg-accent text-text-primary ml-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
								>
									Pending <ClockIcon className="h-4 w-4" />
								</label>
							</div>
							<div className="flex items-center">
								<input
									id="paid"
									name="status"
									type="radio"
									value="paid"
									defaultChecked={invoice.status === "paid"}
									className="border-bg-primary bg-bg-accent text-text-primary h-4 w-4 cursor-pointer focus:ring-2"
								/>
								<label
									htmlFor="paid"
									className="bg-bg-accent text-text-primary ml-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
								>
									Paid <CheckIcon className="h-4 w-4" />
								</label>
							</div>
						</div>
					</div>
				</fieldset>
			</div>
			<div className="mt-6 flex justify-end gap-4">
				<Link
					href="/dashboard/invoices"
					className="bg-bg-accent text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors"
				>
					Cancel
				</Link>
				<Button
					className="bg-bg-active hover:bg-bg-hover text-text-primary rounded-lg px-4 font-medium transition-colors"
					type="submit"
				>
					Edit Invoice
				</Button>
			</div>
		</form>
	);
}
