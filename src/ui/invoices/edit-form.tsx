"use client";

import {
	CheckIcon,
	ClockIcon,
	CurrencyDollarIcon,
	UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { type JSX, useActionState } from "react";
import type { InvoiceEntity } from "@/src/lib/db/entities/invoice";
import type { CustomerField } from "@/src/lib/definitions/customers";
import type { InvoiceFormState } from "@/src/lib/definitions/invoices";
import { updateInvoice } from "@/src/lib/server-actions/invoices";
import { Button } from "@/src/ui/button";

export default function EditInvoiceForm({
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
				<div className="mb-4">
					<label className="mb-2 block text-sm font-medium" htmlFor="customer">
						Choose customer
					</label>
					<div className="relative">
						<select
							className="peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
							defaultValue={invoice.customerId}
							id="customer"
							name="customerId"
						>
							<option disabled value="">
								Select a customer
							</option>
							{customers.map(
								(customer: CustomerField): JSX.Element => (
									<option key={customer.id} value={customer.id}>
										{customer.name}
									</option>
								),
							)}
						</select>
						<UserCircleIcon className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2" />
					</div>
				</div>

				<div className="mb-4">
					<label className="mb-2 block text-sm font-medium" htmlFor="amount">
						Choose an amount
					</label>
					<div className="relative mt-2 rounded-md">
						<div className="relative">
							<input
								aria-describedby="customer-error"
								className="peer border-bg-accent placeholder:text-text-primary block w-full rounded-md border py-2 pl-10 text-sm outline-2"
								defaultValue={invoice.amount}
								id="amount"
								name="amount"
								placeholder="Enter USD amount"
								step="0.01"
								type="number"
							/>
							<CurrencyDollarIcon className="text-text-primary peer-focus:text-text-focus pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2" />
						</div>
					</div>
					<div aria-atomic="true" aria-live="polite" id="customer-error">
						{state.errors?.amount?.map(
							(error: string): JSX.Element => (
								<p className="text-text-error mt-2 text-sm" key={error}>
									{error}
								</p>
							),
						)}
					</div>
				</div>

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
			<div className="mt-6 flex justify-end gap-4">
				<Link
					className="bg-bg-accent text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors"
					href="/dashboard/invoices"
				>
					Cancel
				</Link>
				<Button
					className="bg-bg-active hover:bg-bg-hover text-text-primary rounded-lg px-4 font-medium transition-colors"
					disabled={isPending}
					type="submit"
				>
					Edit Invoice
				</Button>
			</div>
		</form>
	);
}
