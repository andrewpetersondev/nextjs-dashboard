import type { FetchFilteredInvoicesData } from "@/src/lib/definitions/invoices";
import { formatCurrency, formatDateToLocal } from "@/src/lib/utils";
import { DeleteInvoice, UpdateInvoice } from "@/src/ui/invoices/buttons";
import InvoiceStatus from "@/src/ui/invoices/status";
import Image from "next/image";

export default function DesktopTable({
	invoices,
}: { invoices: FetchFilteredInvoicesData[] }) {
	return (
		<table className="text-text-primary hidden min-w-full md:table">
			<thead className="rounded-lg text-left text-sm font-normal">
				<tr>
					<th scope="col" className="px-4 py-5 font-medium sm:pl-6">
						Customer
					</th>
					<th scope="col" className="px-3 py-5 font-medium">
						Email
					</th>
					<th scope="col" className="px-3 py-5 font-medium">
						Amount
					</th>
					<th scope="col" className="px-3 py-5 font-medium">
						Date
					</th>
					<th scope="col" className="px-3 py-5 font-medium">
						Status
					</th>
					<th scope="col" className="relative py-3 pr-3 pl-6">
						<span className="sr-only">Edit</span>
					</th>
				</tr>
			</thead>
			<tbody className="bg-bg-primary">
				{invoices?.map((invoice) => (
					<tr
						key={invoice.id}
						className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
					>
						<td className="py-3 pr-3 pl-6 whitespace-nowrap">
							<div className="flex items-center gap-3">
								<Image
									src={invoice.imageUrl}
									className="rounded-full"
									width={28}
									height={28}
									alt={`${invoice.name}'s profile picture`}
								/>
								<p>{invoice.name}</p>
							</div>
						</td>
						<td className="px-3 py-3 whitespace-nowrap">{invoice.email}</td>
						<td className="px-3 py-3 whitespace-nowrap">
							{formatCurrency(invoice.amount)}
						</td>
						<td className="px-3 py-3 whitespace-nowrap">
							{formatDateToLocal(invoice.date)}
						</td>
						<td className="px-3 py-3 whitespace-nowrap">
							<InvoiceStatus status={invoice.status} />
						</td>
						<td className="py-3 pr-3 pl-6 whitespace-nowrap">
							<div className="flex justify-end gap-3">
								<UpdateInvoice id={invoice.id} />
								<DeleteInvoice id={invoice.id} />
							</div>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
