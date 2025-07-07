import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { JSX } from "react";
import { deleteInvoiceFormAction } from "@/src/lib/actions/invoices.actions";

/**
 * Props for invoice action buttons.
 * @public
 */
export interface InvoiceActionProps {
	id: string;
}

const CREATE_INVOICE_ROUTE = "/dashboard/invoices/create";

/**
 * Renders a Link to create a new invoice.
 */
export const CreateInvoice = (): JSX.Element => (
	<Link
		aria-label="Create Invoice"
		className="bg-bg-secondary text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
		href={CREATE_INVOICE_ROUTE}
	>
		<span className="hidden md:block">Create Invoice</span>
		<PlusIcon className="h-5 md:ml-4" />
	</Link>
);

/**
 * Renders a Link to update an invoice.
 * @param props - Component props
 */
export const UpdateInvoice = ({
	id,
}: Readonly<InvoiceActionProps>): JSX.Element => (
	<Link
		aria-label="Update Invoice"
		className="hover:bg-bg-hover rounded-md border p-2"
		href={`/dashboard/invoices/${encodeURIComponent(id)}/edit`}
	>
		<span className="sr-only">Update</span>
		<PencilIcon className="w-5" />
	</Link>
);

/**
 * Renders a form button to delete an invoice.
 * @param props - Component props
 */
export const DeleteInvoice = ({
	id,
}: Readonly<InvoiceActionProps>): JSX.Element => (
	<form action={deleteInvoiceFormAction}>
		<input name="id" type="hidden" value={id} />
		<button
			aria-label="Delete Invoice"
			className="hover:bg-bg-hover rounded-md border p-2"
			type="submit"
		>
			<span className="sr-only">Delete</span>
			<TrashIcon className="w-5" />
		</button>
	</form>
);
