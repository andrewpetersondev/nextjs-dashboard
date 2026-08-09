import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import {
	DeleteCustomerButton,
	UpdateCustomerLink,
} from "@/modules/customers/presentation/components/customer-action-buttons";
import { CustomerAvatar } from "@/modules/customers/presentation/components/customer-avatar";
import { TableCell, TableRow } from "@/ui/atoms/table.atom";

/**
 * Props for the CustomerTableRow component.
 */
interface CustomerTableRowProps {
	customer: FormattedCustomersTableRow;
	deleteAction: (formData: FormData) => void;
	deletePending: boolean;
}

/**
 * Renders a single customer row for the desktop table.
 * @param customer - The customer data to display.
 */
export function CustomersTableDesktopRow({
	customer,
	deleteAction,
	deletePending,
}: CustomerTableRowProps): JSX.Element {
	return (
		<TableRow className="group hover:bg-bg-active" data-cy="customer-row">
			<TableCell className="whitespace-nowrap py-5 pr-3 pl-4 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
				<div className="flex items-center gap-3">
					<CustomerAvatar imageUrl={customer.imageUrl} name={customer.name} />
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
			<TableCell className="whitespace-nowrap px-3 py-5 text-sm">
				<div className="flex justify-end gap-2">
					<UpdateCustomerLink id={customer.id} />
					<DeleteCustomerButton
						action={deleteAction}
						disabled={deletePending}
						id={customer.id}
						name={customer.name}
					/>
				</div>
			</TableCell>
		</TableRow>
	);
}
