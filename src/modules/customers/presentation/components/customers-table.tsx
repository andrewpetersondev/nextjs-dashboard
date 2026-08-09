"use client";
import { type JSX, useActionState, useId } from "react";
import type { FormattedCustomersTableRow } from "@/modules/customers/domain/types";
import { deleteCustomerAction } from "@/modules/customers/presentation/actions/delete-customer.action";
import { CreateCustomerLink } from "@/modules/customers/presentation/components/customer-action-buttons";
import { CustomersTableDesktop } from "@/modules/customers/presentation/components/customers-table-desktop";
import { CustomersTableMobile } from "@/modules/customers/presentation/components/customers-table-mobile";
import type { FormState } from "@/shared/forms/core/form-result.dto";
import { H1 } from "@/ui/atoms/headings.atom";
import { useFormMessage } from "@/ui/forms/hooks/use-form-message";
import { SearchBoxMolecule } from "@/ui/molecules/search-box.molecule";
import { ServerMessageMolecule } from "@/ui/molecules/server-message.molecule";

interface CustomersTableProps {
	customers: FormattedCustomersTableRow[];
}

/**
 * The customers list, and the owner of the shared delete state.
 *
 * @remarks
 * One `useActionState` serves every row's delete button, so there is exactly
 * one `role="alert"` region on the page. That matters more here than on the
 * other tables: deleting a customer can be *refused* (invoices still reference
 * them), and the refusal message — which names the customer and the invoice
 * count — is the only place that outcome is ever explained.
 *
 * No redirect follows a successful delete; the action revalidates this path, so
 * the row simply disappears from the refreshed table.
 */
export function CustomersTable({
	customers,
}: CustomersTableProps): JSX.Element {
	const headingId = useId();

	const [deleteState, deleteAction, deletePending] = useActionState<
		FormState<unknown>,
		FormData
	>(deleteCustomerAction, null);

	const showAlert = useFormMessage(deleteState);

	return (
		<section
			aria-labelledby={headingId}
			className="w-full"
			data-cy="customers-section"
		>
			<div className="flex items-center justify-between gap-4">
				<H1 className="mb-8" id={headingId}>
					Customers
				</H1>
				<CreateCustomerLink />
			</div>
			<SearchBoxMolecule placeholder="Search customers..." />
			<ServerMessageMolecule showAlert={showAlert} state={deleteState} />
			<div className="mt-6 flow-root">
				<div className="overflow-x-auto">
					<div className="inline-block min-w-full align-middle">
						<div className="overflow-hidden rounded-md bg-bg-accent p-2 md:pt-0">
							<CustomersTableMobile
								customers={customers}
								deleteAction={deleteAction}
								deletePending={deletePending}
							/>
							<CustomersTableDesktop
								customers={customers}
								deleteAction={deleteAction}
								deletePending={deletePending}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
