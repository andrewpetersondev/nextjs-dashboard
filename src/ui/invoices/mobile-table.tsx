import type { FetchFilteredInvoicesData } from "@/src/lib/definitions/invoices";
import { formatCurrency, formatDateToLocal } from "@/src/lib/utils";
import { DeleteInvoice, UpdateInvoice } from "@/src/ui/invoices/buttons";
import InvoiceStatus from "@/src/ui/invoices/status";
import Image from "next/image";

export default function MobileTable({
	invoices,
}: { invoices: FetchFilteredInvoicesData[] }) {
	return (
		<div className="md:hidden">
			{invoices?.map((invoice) => (
				<div
					key={invoice.id}
					className="bg-bg-primary mb-2 w-full rounded-md p-4"
				>
					<div className="flex items-center justify-between border-b pb-4">
						<div>
							<div className="mb-2 flex items-center">
								<Image
									src={invoice.imageUrl}
									className="mr-2 rounded-full"
									width={28}
									height={28}
									alt={`${invoice.name}'s profile picture`}
								/>
								<p>{invoice.name}</p>
							</div>
							<p className="text-text-primary text-sm">{invoice.email}</p>
						</div>
						<InvoiceStatus paymentStatus={invoice.paymentStatus || "unknown"} />
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
			))}
		</div>
	);
}
