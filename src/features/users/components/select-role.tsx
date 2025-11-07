// `src/features/users/components/select-role.tsx`
import type React from "react";
import { useId } from "react";
import {
  GUEST_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/features/auth/lib/auth.roles";
import type { FieldError } from "@/shared/forms/domain/models/field-error";
import { SelectMenu, type SelectMenuProps } from "@/ui/atoms/select-menu";
import { ErrorMessage } from "@/ui/forms/error-message";

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
interface SelectRoleProps
  extends Omit<
    SelectMenuProps<RoleOption>,
    "options" | "id" | "name" | "value"
  > {
  error?: FieldError;
  value?: UserRole;
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
}) => {
  const idBase = useId();
  const selectId = `${idBase}-role-select`;
  const errorId = `${idBase}-role-error`;

  return (
    <div>
      <SelectMenu
        error={error}
        errorId={errorId}
        id={selectId}
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
        id={errorId}
        label="Select role error"
      />
    </div>
  );
};
