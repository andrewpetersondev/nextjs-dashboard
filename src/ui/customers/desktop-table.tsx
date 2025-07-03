import Image from "next/image";
import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/src/lib/definitions/customers.ts";

export async function DesktopTable({
	customers,
}: {
	customers: FormattedCustomersTableRow[];
}): Promise<JSX.Element> {
	return (
		<table className="text-text-primary hidden min-w-full rounded-md md:table">
			{/* Table header with column names */}
			<thead className="bg-bg-accent rounded-md text-left text-sm font-normal">
				<tr>
					<th className="px-4 py-5 font-medium sm:pl-6" scope="col">
						Name
					</th>
					<th className="px-3 py-5 font-medium" scope="col">
						Email
					</th>
					<th className="px-3 py-5 font-medium" scope="col">
						Total Invoices
					</th>
					<th className="px-3 py-5 font-medium" scope="col">
						Total Pending
					</th>
					<th className="px-4 py-5 font-medium" scope="col">
						Total Paid
					</th>
				</tr>
			</thead>

			{/* Table body with customer details */}
			<tbody className="bg-bg-primary divide-bg-accent text-text-primary divide-y">
				{customers.map(
					(customer: FormattedCustomersTableRow): JSX.Element => (
						<tr
							className="group cursor-pointer hover:bg-bg-active"
							key={customer.id}
						>
							{/* Customer name and profile picture */}
							<td className="text-text-primary py-5 pr-3 pl-4 text-sm whitespace-nowrap group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
								<div className="flex items-center gap-3">
									<Image
										alt={`${customer.name}'s profile picture`}
										className="rounded-full"
										height={28}
										src={customer.imageUrl}
										width={28}
									/>
									<p>{customer.name}</p>
								</div>
							</td>

							{/* Customer email */}
							<td className="px-4 py-5 text-sm whitespace-nowrap">
								{customer.email}
							</td>

							{/* Total invoices */}
							<td className="px-4 py-5 text-sm whitespace-nowrap">
								{customer.totalInvoices}
							</td>

							{/* Total pending amount */}
							<td className="px-4 py-5 text-sm whitespace-nowrap">
								{customer.totalPending}
							</td>

							{/* Total paid amount */}
							<td className="px-4 py-5 text-sm whitespace-nowrap group-first-of-type:rounded-md group-last-of-type:rounded-md">
								{customer.totalPaid}
							</td>
						</tr>
					),
				)}
			</tbody>
		</table>
	);
}
