import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { JSX } from "react";
import { deleteUserFormAction } from "@/src/lib/server-actions/users.actions";

/**
 * Renders a button that links to the user creation page.
 * The button displays “Create User” text on medium and larger screens
 * and shows only a plus icon on smaller screens.
 * @returns {JSX.Element} A Link component styled as a button.
 */
export function CreateUser(): JSX.Element {
	return (
		<Link
			className="bg-bg-secondary text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
			href="/dashboard/users/create"
		>
			<span className="hidden md:block">Create User</span>{" "}
			<PlusIcon className="h-5 md:ml-4" />
		</Link>
	);
}

/**
 * Renders a button that links to the user edit page for a specific user.
 * @param {Object} props - Component properties
 * @param {string} props.id - The ID of the user to be updated
 * @returns {JSX.Element} A Link component styled as a button with an edit icon
 */
export function UpdateUser({ id }: { id: string }): JSX.Element {
	return (
		<Link
			className="hover:bg-bg-hover rounded-md border p-2"
			href={`/dashboard/users/${id}/edit`}
		>
			<span className="sr-only">Update</span>
			<PencilIcon className="w-5" />
		</Link>
	);
}

/**
 * Renders a form with a delete button that triggers user deletion.
 * @param {Object} props - Component properties
 * @param {string} props.id - The ID of the user to be deleted
 * @returns {JSX.Element} A form with a submit button styled with a delete icon
 */
export function DeleteUser({ id }: { id: string }): JSX.Element {
	return (
		<form action={deleteUserFormAction}>
			{/* Hidden input for userId */}
			<input name="userId" type="hidden" value={id} />
			<button className="hover:bg-bg-hover rounded-md border p-2" type="submit">
				<span className="sr-only">Delete</span>
				<TrashIcon className="w-5" />
			</button>
		</form>
	);
}
