import type React from "react";
import { USER_ROLES, type UserRole } from "@/lib/definitions/users.types";
import { ErrorMessage } from "@/ui/components/error-message";
import { SelectMenu, type SelectMenuProps } from "@/ui/components/select-menu";

/**
 * Role option type for select menu.
 */
interface RoleOption {
	id: UserRole; // Use 'id' to match SelectMenu's expected shape
	name: string;
}

/**
 * Available roles for user creation.
 * Use USER_ROLES constant for maintainability.
 */
const ROLE_OPTIONS: RoleOption[] = USER_ROLES.filter(
	(role) => role !== "guest", // Exclude 'guest' if not assignable
).map((role) => ({
	id: role,
	name: role.charAt(0).toUpperCase() + role.slice(1),
}));

/**
 * Props for the SelectRole component.
 */
interface SelectRoleProps
	extends Omit<SelectMenuProps<RoleOption>, "options" | "id" | "name"> {
	error?: string[];
}

/**
 * Accessible and reusable role select component.
 * @see CustomerSelect for style and API consistency.
 */
export const SelectRole: React.FC<SelectRoleProps> = ({ error, ...props }) => (
	<div>
		<SelectMenu
			error={error}
			id="role"
			name="role"
			options={ROLE_OPTIONS}
			placeholder="Select a role"
			{...props}
		/>
		<ErrorMessage
			dataCy="users-select-role"
			error={error}
			id="users-select-role-error"
			label="Select role error"
		/>
	</div>
);
