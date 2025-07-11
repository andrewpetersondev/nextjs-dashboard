import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { JSX } from "react";
import { deleteInvoiceFormAction } from "@/features/invoices/invoice.actions";

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
    className="flex h-10 items-center rounded-lg bg-bg-secondary px-4 font-medium text-sm text-text-primary transition-colors hover:bg-bg-hover focus-visible:outline focus-visible:outline-blue-600 focus-visible:outline-offset-2"
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
    className="rounded-md border p-2 hover:bg-bg-hover"
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
      className="rounded-md border p-2 hover:bg-bg-hover"
      type="submit"
    >
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </button>
  </form>
);
