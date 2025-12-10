import type React from "react";
import { useId } from "react";
import {
  GUEST_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/modules/auth/domain/roles/auth.roles";
import type { FieldError } from "@/shared/forms/types/form.types";
import { SelectField } from "@/ui/molecules/select-field";

/**
 * Role option type for select menu.
 */
interface RoleOption {
  id: UserRole;
  name: string;
}

// --- Define ROLE_OPTIONS constant ---
const ROLE_OPTIONS: RoleOption[] = USER_ROLES.filter(
  (role) => role !== (GUEST_ROLE as UserRole),
).map((role) => ({
  id: role,
  name: role.charAt(0).toUpperCase() + role.slice(1),
}));

// --- Define SelectRoleProps ---
interface SelectRoleProps {
  error?: FieldError;
  value?: UserRole;
  defaultValue?: UserRole;
  disabled?: boolean;
  dataCy?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Accessible and reusable role select component.
 * @param error - Validation errors for the role field.
 * @param value - The selected user role.
 * @param onChange - Handler for role selection changes.
 * @param props - Additional props for the SelectMenu component.
 */
export const UserRoleSelect: React.FC<SelectRoleProps> = ({
  error,
  value,
  defaultValue,
  onChange,
  disabled,
  dataCy,
}) => {
  const id = useId();

  return (
    <SelectField
      dataCy={dataCy}
      defaultValue={defaultValue}
      disabled={disabled}
      error={error}
      id={id}
      label="Role"
      name="role"
      onChange={onChange}
      options={ROLE_OPTIONS}
      placeholder="Select a role"
      value={value}
    />
  );
};
