import type { JSX } from "react";
import type { UserDto } from "@/modules/users/application/dtos/user.dto";
import { readFilteredUsersAction } from "@/modules/users/presentation/actions/read-filtered-users.action";
import {
  DeleteUserButton,
  UpdateUserLink,
} from "@/modules/users/presentation/components/user-action-buttons";

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
    <div data-cy="users-table">
      {users?.map(
        (user: UserDto): JSX.Element => (
          <div
            className="mb-2 w-full rounded-md bg-bg-primary p-4"
            data-cy="user-row"
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
                <UpdateUserLink id={user.id} />
                <DeleteUserButton id={user.id} />
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
