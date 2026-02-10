import { PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { JSX } from "react";

/**
 * Renders a button that links to the user creation page.
 * The button displays “Create User” text on medium and larger screens
 * and shows only a plus icon on smaller screens.
 * @returns {JSX.Element} A Link component styled as a button.
 */
export function CreateUserLink(): JSX.Element {
  return (
    <Link
      className="flex h-10 items-center rounded-lg bg-bg-secondary px-4 font-medium text-sm text-text-primary transition-colors hover:bg-bg-hover focus-visible:outline focus-visible:outline-blue-600 focus-visible:outline-offset-2"
      data-cy="add-item-button"
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
export function UpdateUserLink({ id }: { id: string }): JSX.Element {
  return (
    <Link
      className="rounded-md border p-2 hover:bg-bg-hover"
      data-cy="edit-item-button"
      href={`/dashboard/users/${id}/edit`}
    >
      <span className="sr-only">Update</span>
      <PencilIcon className="w-5" />
    </Link>
  );
}
