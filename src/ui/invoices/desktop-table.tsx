import Image from "next/image";
import type { JSX } from "react";
import type { FetchFilteredInvoicesData } from "@/lib/definitions/invoices.types";
import { formatCurrency, formatDateToLocal } from "@/lib/utils/utils";
import { DeleteInvoice, UpdateInvoice } from "@/ui/invoices/buttons";
import { InvoiceStatusComponent } from "@/ui/invoices/status";

export const DesktopTable = ({
	invoices,
}: {
	invoices: FetchFilteredInvoicesData[];
}): JSX.Element => {
	return (
		<table className="hidden min-w-full text-text-primary md:table">
			<thead className="rounded-lg text-left font-normal text-sm">
				<tr>
					<th className="px-4 py-5 font-medium sm:pl-6" scope="col">
						Customer
					</th>
					<th className="px-3 py-5 font-medium" scope="col">
						Email
					</th>
					<th className="px-3 py-5 font-medium" scope="col">
						Amount
					</th>
					<th className="px-3 py-5 font-medium" scope="col">
						Date
					</th>
					<th className="px-3 py-5 font-medium" scope="col">
						Status
					</th>
					<th className="relative py-3 pr-3 pl-6" scope="col">
						<span className="sr-only">Edit</span>
					</th>
				</tr>
			</thead>
			<tbody className="bg-bg-primary">
				{invoices?.map(
					(invoice: FetchFilteredInvoicesData): JSX.Element => (
						<tr
							className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
							key={invoice.id}
						>
							<td className="whitespace-nowrap py-3 pr-3 pl-6">
								<div className="flex items-center gap-3">
									<Image
										alt={`${invoice.name}'s profile picture`}
										className="rounded-full"
										height={28}
										src={invoice.imageUrl}
										width={28}
									/>
									<p>{invoice.name}</p>
								</div>
							</td>
							<td className="whitespace-nowrap px-3 py-3">{invoice.email}</td>
							<td className="whitespace-nowrap px-3 py-3">
								{formatCurrency(invoice.amount)}
							</td>
							<td className="whitespace-nowrap px-3 py-3">
								{formatDateToLocal(invoice.date)}
							</td>
							<td className="whitespace-nowrap px-3 py-3">
								<InvoiceStatusComponent status={invoice.status} />
							</td>
							<td className="whitespace-nowrap py-3 pr-3 pl-6">
								<div className="flex justify-end gap-3">
									<UpdateInvoice id={invoice.id} />
									<DeleteInvoice id={invoice.id} />
								</div>
							</td>
						</tr>
					),
				)}
			</tbody>
		</table>
	);
};
