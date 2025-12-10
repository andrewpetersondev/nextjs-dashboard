import { UserCircleIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { useId } from "react";
import {
  GUEST_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/modules/auth/domain/roles/auth.roles";
import type { FieldError } from "@/shared/forms/types/form.types";
import type { SelectMenuProps } from "@/ui/atoms/select-menu.atom";
import { SelectFieldMolecule } from "@/ui/molecules/select-field.molecule";

/**
 * Role option type for select menu.
 */
interface RoleOption {
  id: UserRole;
  name: string;
}

const ROLE_OPTIONS: RoleOption[] = USER_ROLES.filter(
  (role) => role !== (GUEST_ROLE as UserRole),
).map((role) => ({
  id: role,
  name: role.charAt(0).toUpperCase() + role.slice(1),
}));

/**
 * Props for the UserRoleSelect component.
 */
export interface UserRoleSelectProps
  extends Omit<SelectMenuProps<RoleOption>, "id" | "name" | "options"> {
  readonly dataCy?: string;
  readonly error?: FieldError;
}

/**
 * Accessible role dropdown for user forms.
 * Ensures a valid role is selected before submission.
 * @param error - Validation errors for the role field.
 * @param dataCy - Test identifier for the component.
 * @param props - Additional props for the SelectMenu component.
 */
export const UserRoleSelect = ({
  dataCy,
  error,
  ...props
}: UserRoleSelectProps): JSX.Element => {
  const id = useId();

  return (
    <SelectFieldMolecule
      dataCy={dataCy}
      error={error}
      icon={UserCircleIcon}
      id={id}
      label="Choose Role"
      name="role"
      options={ROLE_OPTIONS}
      placeholder="Select a role"
      {...props}
    />
  );
};
