import type React from "react";
import type { FormFieldError } from "@/lib/definitions/form";
import { USER_ROLES, type UserRole } from "@/lib/definitions/users.types";
import { ErrorMessage } from "@/ui/components/error-message";
import { SelectMenu, type SelectMenuProps } from "@/ui/components/select-menu";

/**
 * Role option type for select menu.
 */
interface RoleOption {
  id: UserRole; // UserRole is a string union
  name: string;
}

// --- Define ROLE_OPTIONS constant ---
// Filters out "guest" and maps roles to { id, name } objects with capitalized names.
const ROLE_OPTIONS: RoleOption[] = USER_ROLES.filter(
  (role) => role !== "guest",
).map((role) => ({
  id: role,
  name: role.charAt(0).toUpperCase() + role.slice(1),
}));

// --- Define SelectRoleProps ---
interface SelectRoleProps
  extends Omit<
    SelectMenuProps<RoleOption>,
    "options" | "id" | "name" | "value"
  > {
  error?: FormFieldError;
  value?: UserRole;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Accessible and reusable role select component.
 * @param error - Validation errors for the role field.
 * @param value - The selected user role.
 * @param onChange - Handler for role selection changes.
 */
export const SelectRole: React.FC<SelectRoleProps> = ({
  error,
  value,
  onChange,
  ...props
}) => (
  <div>
    <SelectMenu
      error={error}
      id="role"
      name="role"
      onChange={onChange ?? (() => {})} // Ensure a function is always passed
      options={ROLE_OPTIONS}
      placeholder="Select a role"
      value={value as string | undefined}
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
