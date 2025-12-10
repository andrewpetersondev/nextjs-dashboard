import { UserCircleIcon } from "@heroicons/react/24/outline";
import type React from "react";
import { useId } from "react";
import {
  GUEST_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/modules/auth/domain/roles/auth.roles";
import type { FieldError } from "@/shared/forms/types/form.types";
import { Label } from "@/ui/atoms/label";
import { SelectMenu } from "@/ui/atoms/select-menu";
import { FieldErrorComponent } from "@/ui/molecules/field-error-component";
import { InputFieldCard } from "@/ui/molecules/input-field-card";

/**
 * Role option type for select menu.
 */
interface RoleOption {
  id: UserRole;
  name: string;
}

interface SelectRoleProps {
  dataCy?: string;
  defaultValue?: UserRole;
  disabled?: boolean;
  error?: FieldError;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: UserRole;
}

const ROLE_OPTIONS: RoleOption[] = USER_ROLES.filter(
  (role) => role !== (GUEST_ROLE as UserRole),
).map((role) => ({
  id: role,
  name: role.charAt(0).toUpperCase() + role.slice(1),
}));

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
  const errorId = `${id}-errors`;
  const hasError = Array.isArray(error) && error.length > 0;

  return (
    <InputFieldCard>
      <div>
        <Label htmlFor={id} text="Role" />
        <div className="flex items-center [&>div]:flex-1">
          <SelectMenu
            dataCy={dataCy}
            defaultValue={defaultValue}
            disabled={disabled}
            error={error}
            errorId={errorId}
            id={id}
            name="role"
            onChange={onChange}
            options={ROLE_OPTIONS}
            placeholder="Select a role"
            value={value}
          />
          <span aria-hidden="true">
            <UserCircleIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent" />
          </span>
        </div>
        {hasError && (
          <FieldErrorComponent
            dataCy={dataCy ? `${dataCy}-errors` : undefined}
            error={error}
            id={errorId}
            label="Role error:"
          />
        )}
      </div>
    </InputFieldCard>
  );
};
