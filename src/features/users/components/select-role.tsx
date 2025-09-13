import type React from "react";
import { AUTH_ROLES, type AuthRole, ROLES } from "@/shared/auth/domain/roles";
import type { FormFieldError } from "@/shared/forms/types";
import { SelectMenu, type SelectMenuProps } from "@/ui/atoms/select-menu";
import { ErrorMessage } from "@/ui/forms/error-message";

/**
 * Role option type for select menu.
 */
interface RoleOption {
  id: AuthRole; // UserRole is a string union
  name: string;
}

// --- Define ROLE_OPTIONS constant ---
// Filters out "guest" and maps roles to { id, name } objects with capitalized names.
const ROLE_OPTIONS: RoleOption[] = AUTH_ROLES.filter(
  (role) => role !== ROLES.GUEST,
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
  value?: AuthRole;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Accessible and reusable role select component.
 * @param error - Validation errors for the role field.
 * @param value - The selected user role.
 * @param onChange - Handler for role selection changes.
 * @param props - Additional props for the SelectMenu component.
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
      onChange={onChange}
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
