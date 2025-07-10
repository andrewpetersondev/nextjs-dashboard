import type { JSX } from "react";
import { readFilteredUsersAction } from "@/lib/actions/users.actions"; // Use server action
import type { UserDto } from "@/lib/dto/user.dto";
import { DeleteUser, UpdateUser } from "@/ui/users/buttons";

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
            className="mb-2 w-full rounded-md bg-bg-primary p-4"
            key={user.id}
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="mb-2 flex items-center">
                  <p>{user.username}</p>
                </div>
                <p className="text-sm text-text-primary">{user.email}</p>
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
