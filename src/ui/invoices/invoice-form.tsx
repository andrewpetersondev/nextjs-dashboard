"use client";
import type { CustomerField } from "@/src/lib/definitions/customers.ts";
import type { InvoiceFormFields } from "@/src/lib/definitions/invoices.ts";

/**
 * InvoiceForm expects these props:
 * - action: submit callback for the form
 * - state: server state with errors/message/success
 * - initialValues: initial invoice values (used for edit)
 * - customers: dropdown options
 * - pending: a submission loading flag
 * ...plus presentational props
 */
export function InvoiceForm({
	action,
	cancelHref,
	description,
	customers,
	initialValues,
	isEdit,
	pending,
	state,
	submitLabel,
	title,
}: {
	action: (formData: FormData) => void | Promise<void>;
	cancelHref: string;
	description?: string;
	customers: CustomerField[];
	initialValues: Partial<InvoiceFormFields>;
	isEdit: boolean;
	pending: boolean;
	state: any;
	submitLabel: string;
	title: string;
}) {
	return (
		<form action={action} className="space-y-6">
			<h2 className="text-xl font-bold">{title}</h2>
			{!!description && <div className="mb-2 text-sm">{description}</div>}
			{/* -- Customer Dropdown -- */}
			<div>
				<label className="block mb-1" htmlFor="customerId">
					Customer
				</label>
				<select
					className="w-full border rounded p-2"
					defaultValue={initialValues.customerId ?? ""}
					id="customerId"
					name="customerId"
				>
					<option value="">Select...</option>
					{customers.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
				</select>
				{state?.errors?.customerId?.map((msg: string) => (
					<div className="text-red-600 text-xs" key={msg}>
						{msg}
					</div>
				))}
			</div>
			{/* -- Amount -- */}
			<div>
				<label className="block mb-1" htmlFor="amount">
					Amount
				</label>
				<input
					className="w-full border rounded p-2"
					defaultValue={initialValues.amount ?? ""}
					id="amount"
					name="amount"
					type="number"
				/>
				{state?.errors?.amount?.map((msg: string) => (
					<div className="text-red-600 text-xs" key={msg}>
						{msg}
					</div>
				))}
			</div>
			{/* -- Status -- */}
			<div>
				<label className="block mb-1" htmlFor="status">
					Status
				</label>
				<select
					className="w-full border rounded p-2"
					defaultValue={initialValues.status ?? ""}
					id="status"
					name="status"
				>
					<option value="">Select status...</option>
					<option value="pending">Pending</option>
					<option value="paid">Paid</option>
					<option value="overdue">Overdue</option>
				</select>
				{state?.errors?.status?.map((msg: string) => (
					<div className="text-red-600 text-xs" key={msg}>
						{msg}
					</div>
				))}
			</div>
			{/* Success/Error message */}
			{state?.message && (
				<div className={state?.success ? "text-green-700" : "text-red-700"}>
					{state.message}
				</div>
			)}
			{/* Submit/Cancel */}
			<div className="flex items-center gap-4">
				<button
					className="bg-primary rounded px-4 py-2 text-white disabled:opacity-70"
					disabled={pending}
					type="submit"
				>
					{submitLabel}
				</button>
				<a className="underline text-blue-600" href={cancelHref}>
					Cancel
				</a>
			</div>
		</form>
	);
}
