import Image from "next/image";
import type { JSX } from "react";
import { formatInvoiceDateLocalized } from "@/modules/invoices/domain/invoice.date-utils";
import type { InvoiceListFilter } from "@/modules/invoices/domain/invoice.types";
import {
	DeleteInvoiceButton,
	UpdateInvoiceLink,
} from "@/modules/invoices/presentation/components/invoice-links";
import { InvoiceStatusComponent } from "@/modules/invoices/presentation/components/tables/status";
import { formatCurrency } from "@/shared/primitives/money/convert";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/ui/atoms/table";

export const DesktopTable = ({
	invoices,
}: {
	invoices: InvoiceListFilter[];
}): JSX.Element => {
	return (
		<Table className="hidden min-w-full md:table">
			<TableHeader className="rounded-lg font-normal text-sm">
				<TableRow className="hover:bg-transparent">
					<TableHead className="px-4 py-5 font-medium sm:pl-6" scope="col">
						Customer
					</TableHead>
					<TableHead className="px-3 py-5 font-medium" scope="col">
						Email
					</TableHead>
					<TableHead className="px-3 py-5 font-medium" scope="col">
						Amount
					</TableHead>
					<TableHead className="px-3 py-5 font-medium" scope="col">
						Date
					</TableHead>
					<TableHead className="px-3 py-5 font-medium" scope="col">
						Status
					</TableHead>
					<TableHead className="relative py-3 pr-3 pl-6" scope="col">
						<span className="sr-only">Edit</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{invoices?.map(
					(invoice): JSX.Element => (
						<TableRow
							className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
							data-cy="invoice-row"
							key={invoice.id}
						>
							<TableCell className="whitespace-nowrap py-3 pr-3 pl-6">
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
							</TableCell>
							<TableCell className="whitespace-nowrap px-3 py-3">
								{invoice.email}
							</TableCell>
							<TableCell className="whitespace-nowrap px-3 py-3">
								{formatCurrency(invoice.amount)}
							</TableCell>
							<TableCell className="whitespace-nowrap px-3 py-3">
								{formatInvoiceDateLocalized(invoice.date.toISOString())}
							</TableCell>
							<TableCell className="whitespace-nowrap px-3 py-3">
								<InvoiceStatusComponent status={invoice.status} />
							</TableCell>
							<TableCell className="whitespace-nowrap py-3 pr-3 pl-6">
								<div className="flex justify-end gap-3">
									<UpdateInvoiceLink id={invoice.id} />
									<DeleteInvoiceButton id={invoice.id} />
								</div>
							</TableCell>
						</TableRow>
					),
				)}
			</TableBody>
		</Table>
	);
};
