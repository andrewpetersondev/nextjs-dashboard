import type { JSX } from "react";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import { CustomersTableMobileRow } from "@/modules/customers/presentation/components/customers-table-mobile-row";

/**
 * Renders a responsive mobile table for customer data.
 * @param customers - Array of formatted customer table rows.
 * @param deleteAction - Shared delete action owned by `CustomersTable`.
 * @param deletePending - Whether a delete is in flight, to disable the buttons.
 * @returns JSX.Element
 */
export function CustomersTableMobile({
	customers,
	deleteAction,
	deletePending,
}: {
	customers: FormattedCustomersTableRow[];
	deleteAction: (formData: FormData) => void;
	deletePending: boolean;
}): JSX.Element {
	return (
		<div
			className="md:hidden"
			data-cy="customers-table-mobile"
			data-testid="mobile-table"
		>
			{customers.map((customer) => (
				<CustomersTableMobileRow
					customer={customer}
					deleteAction={deleteAction}
					deletePending={deletePending}
					key={customer.id}
				/>
			))}
		</div>
	);
}
