import type { UserDto } from "@/features/users/user.dto";

export function UserInfoPanel({ user }: { user: UserDto }) {
  return (
    <div className="mb-6 rounded-lg border bg-muted p-4">
      <div className="mb-1 font-semibold text-primary">Current Information</div>
      <ul className="ml-2 text-sm">
        <li>
          <span className="font-medium">Username:</span> {user.username}
        </li>
        <li>
          <span className="font-medium">Email:</span> {user.email}
        </li>
        <li>
          <span className="font-medium">Role:</span> {user.role}
        </li>
        <li>
          <span className="font-medium">User ID:</span> {user.id}
        </li>
      </ul>
    </div>
  );
}
