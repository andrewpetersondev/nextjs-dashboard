import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { JSX } from "react";
import { ROUTES } from "@/shared/routing/routes";

/**
 * Links to the customer creation page. Label collapses to an icon on small
 * screens, matching the invoice and user create buttons.
 */
export function CreateCustomerLink(): JSX.Element {
	return (
		<Link
			aria-label="Create Customer"
			className="flex h-10 items-center rounded-lg bg-bg-secondary px-4 font-medium text-sm text-text-primary transition-colors hover:bg-bg-hover focus-visible:outline focus-visible:outline-blue-600 focus-visible:outline-offset-2"
			data-cy="add-item-button"
			href={ROUTES.dashboard.createCustomer()}
		>
			<span className="hidden md:block">Create Customer</span>{" "}
			<PlusIcon className="h-5 md:ml-4" />
		</Link>
	);
}

/**
 * Links to the edit page for one customer.
 */
export function UpdateCustomerLink({ id }: { id: string }): JSX.Element {
	return (
		<Link
			className="rounded-md border p-2 hover:bg-bg-hover"
			data-cy="edit-item-button"
			href={ROUTES.dashboard.customerEdit(id)}
		>
			<span className="sr-only">Edit</span>
			<PencilIcon className="w-5" />
		</Link>
	);
}

/**
 * Submits one customer's id to a delete action owned by an ancestor.
 *
 * @remarks
 * The action is passed in rather than imported so every row shares a single
 * `useActionState` in `CustomersTable`. Per-row state would mount one
 * `role="alert"` live region per customer, and a refusal would then be
 * announced from whichever of N identical regions happened to update.
 *
 * The customer's name is in the accessible label because the visible control is
 * an icon repeated once per row — "Delete" alone gives a screen reader user no
 * way to tell the rows apart.
 */
export function DeleteCustomerButton({
	action,
	disabled = false,
	id,
	name,
}: {
	action: (formData: FormData) => void;
	disabled?: boolean;
	id: string;
	name: string;
}): JSX.Element {
	return (
		<form action={action}>
			<input name="id" type="hidden" value={id} />
			<button
				className="rounded-md border p-2 hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
				data-cy="delete-item-button"
				disabled={disabled}
				type="submit"
			>
				<span className="sr-only">Delete {name}</span>
				<TrashIcon className="w-5" />
			</button>
		</form>
	);
}
