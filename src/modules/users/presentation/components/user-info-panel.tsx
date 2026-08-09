import type { JSX } from "react";
import type { UserDto } from "@/modules/users/application/dtos/user.dto";

/**
 * Read-only summary shown above the edit-user form.
 *
 * Renders the stored values so an editor can see what they are changing from —
 * the form's own inputs show the pending state. Takes a `UserDto`, which
 * already excludes the password hash.
 */
export function UserInfoPanel({ user }: { user: UserDto }): JSX.Element {
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
