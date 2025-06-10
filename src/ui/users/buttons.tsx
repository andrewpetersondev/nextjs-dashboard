import { PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { JSX } from "react";

export function CreateUser(): JSX.Element {
	return (
		<Link
			href="/dashboard/users/create"
			className="bg-bg-secondary text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
		>
			<span className="hidden md:block">Create User</span>{" "}
			<PlusIcon className="h-5 md:ml-4" />
		</Link>
	);
}

export function UpdateUser({ id }: { id: string }): JSX.Element {
	return (
		<Link
			href={`/dashboard/users/${id}/edit`}
			className="hover:bg-bg-hover rounded-md border p-2"
		>
			<span className="sr-only">Update</span>
			<PencilIcon className="w-5" />
		</Link>
	);
}

// export function DeleteUser({ id }: { id: string }) {
//   const deleteUserWithId = deleteUser.bind(null, id);
//   return (
//     <form action={deleteUserWithId}>
//       <button type="submit" className="hover:bg-bg-hover rounded-md border p-2">
//         <span className="sr-only">Delete</span>
//         <TrashIcon className="w-5" />
//       </button>
//     </form>
//   );
// }
