import type { JSX } from "react";
import type { UserDto } from "@/src/lib/dto/user.dto";
import { readFilteredUsersAction } from "@/src/lib/server-actions/users.actions"; // Use server action
import { DeleteUser, UpdateUser } from "@/src/ui/users/buttons";

/**
 * UsersTable component.
 * Fetches filtered users using a server action and renders the user list.
 */
export async function UsersTable({
	query,
	currentPage,
}: {
	query: string;
	currentPage: number;
}): Promise<JSX.Element> {
	const users: UserDto[] = await readFilteredUsersAction(query, currentPage);

	return (
		<div>
			{users?.map(
				(user: UserDto): JSX.Element => (
					<div
						className="bg-bg-primary mb-2 w-full rounded-md p-4"
						key={user.id}
					>
						<div className="flex items-center justify-between border-b pb-4">
							<div>
								<div className="mb-2 flex items-center">
									<p>{user.username}</p>
								</div>
								<p className="text-text-primary text-sm">{user.email}</p>
							</div>

							{user.role}
						</div>
						<div className="flex w-full items-center justify-between pt-4">
							<div className="flex justify-end gap-2">
								<UpdateUser id={user.id} />
								<DeleteUser id={user.id} />
							</div>
						</div>
					</div>
				),
			)}
		</div>
	);
}
