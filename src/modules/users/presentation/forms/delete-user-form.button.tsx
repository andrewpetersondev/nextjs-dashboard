import { TrashIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { deleteUserFormAction } from "@/modules/users/presentation/actions/delete-user-form.action";

/**
 * Renders a form with a delete button that triggers user deletion.
 * @param {Object} props - Component properties
 * @param {string} props.id - The ID of the user to be deleted
 * @returns {JSX.Element} A form with a submit button styled with a delete icon
 */
export function DeleteUserFormButton({ id }: { id: string }): JSX.Element {
  return (
    <form action={deleteUserFormAction}>
      {/* Hidden input for userId */}
      <input name="id" type="hidden" value={id} />
      <button
        className="rounded-md border p-2 hover:bg-bg-hover"
        data-cy="delete-item-button"
        type="submit"
      >
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}
