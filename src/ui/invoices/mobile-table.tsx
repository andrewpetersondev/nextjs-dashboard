import Image from "next/image";
import type { JSX } from "react";
import type { FetchFilteredInvoicesData } from "@/src/lib/definitions/invoices";
import { formatCurrency, formatDateToLocal } from "@/src/lib/utils/utils";
import { DeleteInvoice, UpdateInvoice } from "@/src/ui/invoices/buttons";
import InvoiceStatusComponent from "@/src/ui/invoices/status";

export default function MobileTable({
	invoices,
}: {
	invoices: FetchFilteredInvoicesData[];
}): JSX.Element {
	return (
		<div className="md:hidden">
			{invoices?.map(
				(invoice: FetchFilteredInvoicesData): JSX.Element => (
					<div
						className="bg-bg-primary mb-2 w-full rounded-md p-4"
						key={invoice.id}
					>
						<div className="flex items-center justify-between border-b pb-4">
							<div>
								<div className="mb-2 flex items-center">
									<Image
										alt={`${invoice.name}'s profile picture`}
										className="mr-2 rounded-full"
										height={28}
										src={invoice.imageUrl}
										width={28}
									/>
									<p>{invoice.name}</p>
								</div>
								<p className="text-text-primary text-sm">{invoice.email}</p>
							</div>
							<InvoiceStatusComponent status={invoice.status || "unknown"} />
						</div>
						<div className="flex w-full items-center justify-between pt-4">
							<div>
								<p className="text-xl font-medium">
									{formatCurrency(invoice.amount)}
								</p>
								<p>{formatDateToLocal(invoice.date)}</p>
							</div>
							<div className="flex justify-end gap-2">
								<UpdateInvoice id={invoice.id} />
								<DeleteInvoice id={invoice.id} />
							</div>
						</div>
					</div>
				),
			)}
		</div>
	);
}
