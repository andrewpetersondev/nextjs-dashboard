import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { deleteInvoice } from "@/src/server-actions/invoices";

export function CreateInvoice() {
  return (
    <Link
      href="/dashboard/invoices/create"
      className="flex h-10 items-center rounded-lg bg-bg-secondary px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Invoice</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/invoices/${id}/edit`}
      className="rounded-md border p-2 hover:bg-bg-hover"
    >
      <span className="sr-only">Update</span>
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteInvoice({ id }: { id: string }) {
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);
  return (
    <form action={deleteInvoiceWithId}>
      <button type="submit" className="rounded-md border p-2 hover:bg-bg-hover">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}