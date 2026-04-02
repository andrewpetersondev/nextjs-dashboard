import Image from "next/image";
import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import { TableCell, TableRow } from "@/ui/atoms/table.atom";
import { IMAGE_SIZES } from "@/ui/styles/images.tokens";

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
export function CustomersTableDesktopRow({
	customer,
}: CustomerTableRowProps): JSX.Element {
	return (
		<TableRow
			className="group cursor-pointer hover:bg-bg-active"
			data-cy="customer-row"
		>
			<TableCell className="whitespace-nowrap py-5 pr-3 pl-4 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
				<div className="flex items-center gap-3">
					<Image
						alt={`${customer.name}'s profile picture`}
						className="rounded-full"
						height={IMAGE_SIZES.small}
						priority={false}
						src={customer.imageUrl}
						width={IMAGE_SIZES.small}
					/>
					<p>{customer.name}</p>
				</div>
			</TableCell>
			<TableCell className="whitespace-nowrap px-4 py-5 text-sm">
				{customer.email}
			</TableCell>
			<TableCell className="whitespace-nowrap px-4 py-5 text-sm">
				{customer.totalInvoices}
			</TableCell>
			<TableCell className="whitespace-nowrap px-4 py-5 text-sm">
				{customer.totalPending}
			</TableCell>
			<TableCell className="whitespace-nowrap px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
				{customer.totalPaid}
			</TableCell>
		</TableRow>
	);
}
