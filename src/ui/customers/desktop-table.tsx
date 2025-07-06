import Image from "next/image";
import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/src/lib/definitions/customers.types";

/**
 * Table column definitions for customer data.
 */
const TABLE_COLUMNS = [
	{ key: "name", label: "Name" },
	{ key: "email", label: "Email" },
	{ key: "totalInvoices", label: "Total Invoices" },
	{ key: "totalPending", label: "Total Pending" },
	{ key: "totalPaid", label: "Total Paid" },
] as const;

/**
 * Props for the CustomerTableRow component.
 */
interface CustomerTableRowProps {
	customer: FormattedCustomersTableRow;
}

/**
 * Renders a single customer row for the desktop table.
 * @param customer - The customer data to display.
 */
function CustomerTableRow({ customer }: CustomerTableRowProps): JSX.Element {
	return (
		<tr className="group cursor-pointer hover:bg-bg-active" key={customer.id}>
			<td className="text-text-primary py-5 pr-3 pl-4 text-sm whitespace-nowrap group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
				<div className="flex items-center gap-3">
					<Image
						alt={`${customer.name}'s profile picture`}
						className="rounded-full"
						height={28}
						priority
						src={customer.imageUrl}
						width={28}
					/>
					<p>{customer.name}</p>
				</div>
			</td>
			<td className="px-4 py-5 text-sm whitespace-nowrap">{customer.email}</td>
			<td className="px-4 py-5 text-sm whitespace-nowrap">
				{customer.totalInvoices}
			</td>
			<td className="px-4 py-5 text-sm whitespace-nowrap">
				{customer.totalPending}
			</td>
			<td className="px-4 py-5 text-sm whitespace-nowrap group-first-of-type:rounded-md group-last-of-type:rounded-md">
				{customer.totalPaid}
			</td>
		</tr>
	);
}

/**
 * Renders a responsive desktop table for customer data.
 * @param customers - Array of formatted customer table rows.
 * @returns JSX.Element
 */
export async function DesktopTable({
	customers,
}: {
	customers: FormattedCustomersTableRow[];
}): Promise<JSX.Element> {
	return (
		<table className="text-text-primary hidden min-w-full rounded-md md:table">
			<thead className="bg-bg-accent rounded-md text-left text-sm font-normal">
				<tr>
					{TABLE_COLUMNS.map(({ key, label }) => (
						<th
							className={
								key === "name"
									? "px-4 py-5 font-medium sm:pl-6"
									: key === "totalPaid"
										? "px-4 py-5 font-medium"
										: "px-3 py-5 font-medium"
							}
							key={key}
							scope="col"
						>
							{label}
						</th>
					))}
				</tr>
			</thead>
			<tbody className="bg-bg-primary divide-bg-accent text-text-primary divide-y">
				{customers.map((customer) => (
					<CustomerTableRow customer={customer} key={customer.id} />
				))}
			</tbody>
		</table>
	);
}
