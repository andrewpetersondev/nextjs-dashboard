"use client";

import {
	CheckIcon,
	ClockIcon,
	CurrencyDollarIcon,
	UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { type JSX, useActionState, useEffect, useState } from "react";
import type { CustomerField } from "@/src/lib/definitions/customers.ts";
import type { InvoiceCreateState } from "@/src/lib/definitions/invoices.types.ts";
import { createInvoiceAction } from "@/src/lib/server-actions/invoices.ts";
import { Button } from "@/src/ui/button.tsx";
import { InvoiceServerMessage } from "@/src/ui/invoices/invoice-server-message.tsx";

export function CreateInvoiceForm({
	customers,
}: {
	customers: CustomerField[];
}): JSX.Element {
	const initialState: InvoiceCreateState = {
		errors: {},
		message: "",
		success: false,
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
		<div>
			<form action={action}>
				<div className="bg-bg-accent rounded-md p-4 md:p-6">
					<div className="mb-4">
						<label className="mb-2 block text-sm font-medium" htmlFor="customer">
							Choose customer
						</label>
						<div className="relative">
							<select
								aria-describedby={
									(state.errors?.customerId?.length ?? 0) > 0
										? "customer-error"
										: undefined
								}
								className="peer border-s-bg-secondary placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
								defaultValue=""
								id="customer"
								name="customerId"
							>
								<option disabled={true} value="">
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
						<div aria-atomic="true" aria-live="polite" id="customer-error">
							{/* Render customerId errors, guarding against undefined */}
							{Array.isArray(state.errors?.customerId) &&
							state.errors.customerId.length > 0
								? state.errors.customerId.map((error) => (
										<p className="text-text-error mt-2 text-sm" key={error}>
											{error}
										</p>
									))
								: null}
						</div>
					</div>

					<div className="mb-4">
						<label className="mb-2 block text-sm font-medium" htmlFor="amount">
							Choose an amount
						</label>
						<div className="relative mt-2 rounded-md">
							<div className="relative">
								<input
									aria-describedby={
										(state.errors?.amount?.length ?? 0) > 0 ? "amount-error" : undefined
									}
									className="peer border-bg-secondary placeholder:text-text-secondary block w-full rounded-md border py-2 pl-10 text-sm outline-2"
									id="amount"
									name="amount"
									placeholder="Enter USD amount"
									step="0.01"
									type="number"
								/>
								<CurrencyDollarIcon className="text-text-primary peer-focus:text-text-focus pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2" />
							</div>
						</div>
						<div aria-atomic="true" aria-live="polite" id="amount-error">
							{Array.isArray(state.errors?.amount) && state.errors.amount.length > 0
								? state.errors.amount.map((error) => (
										<p className="text-text-error mt-2 text-sm" key={error}>
											{error}
										</p>
									))
								: null}
						</div>
					</div>

					<fieldset>
						<legend className="mb-2 block text-sm font-medium">
							Set the invoice status
						</legend>
						<div className="border-bg-secondary bg-bg-primary rounded-md border px-[14px] py-3">
							<div className="flex gap-4">
								<div className="flex items-center">
									<input
										aria-describedby={
											(state.errors?.status?.length ?? 0) > 0 ? "status-error" : undefined
										}
										className="border-bg-secondary bg-bg-accent text-text-primary h-4 w-4 cursor-pointer focus:ring-2"
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
										aria-describedby={
											(state.errors?.status?.length ?? 0) > 0 ? "status-error" : undefined
										}
										className="border-bg-secondary bg-bg-accent text-text-primary h-4 w-4 cursor-pointer focus:ring-2"
										id="paid"
										name="status"
										type="radio"
										value="paid"
									/>
									<label
										className="bg-bg-secondary text-text-primary ml-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
										htmlFor="paid"
									>
										Paid <CheckIcon className="h-4 w-4" />
									</label>
								</div>
							</div>
						</div>
						<div aria-atomic="true" aria-live="polite" id="status-error">
							{/* Render status errors */}
							{/* Render customerId errors, guarding against undefined */}
							{Array.isArray(state.errors?.status) && state.errors.status.length > 0
								? state.errors.status.map((error) => (
										<p className="text-text-error mt-2 text-sm" key={error}>
											{error}
										</p>
									))
								: null}
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
					<Button disabled={isPending} type="submit">
						Create Invoice
					</Button>
				</div>
			</form>
			<InvoiceServerMessage showAlert={showAlert} state={state} />
		</div>
	);
}
