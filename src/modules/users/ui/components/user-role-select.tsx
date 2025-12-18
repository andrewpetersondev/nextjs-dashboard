import { UserCircleIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { useId, useMemo } from "react";
import {
  USER_ROLES,
  type UserRole,
} from "@/modules/auth/shared/domain/user/auth.roles";
import type { FieldError } from "@/shared/forms/types/field-error.value";
import type { SelectMenuProps } from "@/ui/atoms/select-menu.atom";
import { SelectFieldMolecule } from "@/ui/molecules/select-field.molecule";

/**
 * Represents a role option for the select menu.
 * @template T - The role type.
 */
interface RoleOption {
  id: UserRole;
  name: UserRole;
}

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

  const roleOptions = useMemo(
    (): RoleOption[] =>
      USER_ROLES.map((role) => ({
        id: role,
        name: role,
      })),
    [],
  );

  return (
    <SelectFieldMolecule
      dataCy={dataCy}
      error={error}
      icon={UserCircleIcon}
      id={id}
      label="Choose Role"
      name="role"
      options={roleOptions}
      placeholder="Select a role"
      {...props}
    />
  );
};
