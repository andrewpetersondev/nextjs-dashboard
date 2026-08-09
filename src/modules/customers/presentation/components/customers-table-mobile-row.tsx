import type { JSX } from "react";
import { CUSTOMER_LABELS } from "@/modules/customers/domain/constants";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import {
	DeleteCustomerButton,
	UpdateCustomerLink,
} from "@/modules/customers/presentation/components/customer-action-buttons";
import { AvatarMolecule } from "@/ui/molecules/avatar.molecule";

/**
 * Props for the CustomerMobileCard component.
 */
interface CustomerMobileCardProps {
	customer: FormattedCustomersTableRow;
	deleteAction: (formData: FormData) => void;
	deletePending: boolean;
}

/**
 * Renders a single customer card for mobile view.
 * @param customer - The customer data to display.
 */
export function CustomersTableMobileRow({
	customer,
	deleteAction,
	deletePending,
}: CustomerMobileCardProps): JSX.Element {
	return (
		// Use role="region" and aria-label for accessibility on a non-interactive card
		<div
			className="mb-2 w-full rounded-md bg-bg-primary p-4"
			data-cy="customer-mobile-card"
			data-testid={`customer-mobile-card-${customer.id}`}
		>
			{/* Customer info: name, profile picture, and email */}
			<div className="flex items-center justify-between border-b pb-4">
				<div>
					<div className="mb-2 flex items-center">
						<div className="flex items-center gap-3">
							<AvatarMolecule
								imageUrl={customer.imageUrl}
								name={customer.name}
							/>
							<p className="font-medium">{customer.name}</p>
						</div>
					</div>
					<p className="text-sm text-text-primary">{customer.email}</p>
				</div>
			</div>

			{/* Customer financial details: pending and paid amounts */}
			<div className="flex w-full items-center justify-between border-b py-5">
				<div className="flex w-1/2 flex-col">
					<p className="text-xs">{CUSTOMER_LABELS.pending}</p>
					<p className="font-medium">{customer.totalPending}</p>
				</div>
				<div className="flex w-1/2 flex-col">
					<p className="text-xs">{CUSTOMER_LABELS.paid}</p>
					<p className="font-medium">{customer.totalPaid}</p>
				</div>
			</div>

			{/* Customer invoice total, and the row's actions */}
			<div className="flex items-center justify-between pt-4 text-sm">
				<p>
					{customer.totalInvoices} {CUSTOMER_LABELS.invoices}
				</p>
				<div className="flex gap-2">
					<UpdateCustomerLink id={customer.id} />
					<DeleteCustomerButton
						action={deleteAction}
						disabled={deletePending}
						id={customer.id}
						name={customer.name}
					/>
				</div>
			</div>
		</div>
	);
}
