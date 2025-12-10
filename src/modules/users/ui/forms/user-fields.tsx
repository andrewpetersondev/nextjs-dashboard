import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { useId } from "react";
import type { UserDto } from "@/modules/users/domain/dto/user.dto";
import type { CreateUserFormFieldNames } from "@/modules/users/domain/user.schema";
import { UserRoleSelect } from "@/modules/users/ui/components/user-role-select";
import type { FieldError } from "@/shared/forms/types/form.types";
import { InputField } from "@/ui/molecules/input-field";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <1 line over limit>
export function UserFields({
  values = {},
  errors,
  showPassword = true,
  isEdit = false,
  disabled = false,
}: {
  values?: Partial<UserDto> & { password?: string };
  errors?: Partial<Record<CreateUserFormFieldNames, FieldError>>;
  showPassword?: boolean;
  isEdit?: boolean;
  disabled?: boolean;
}): JSX.Element {
  const usernameId = useId();
  const emailId = useId();
  const passwordId = useId();

  return (
    <>
      <InputField
        autoComplete="username"
        dataCy="user-username-input"
        defaultValue={values.username}
        disabled={disabled}
        error={errors?.username}
        icon={
          <UserIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent" />
        }
        id={usernameId}
        label="Username"
        name="username"
        required={true}
        type="text"
      />

      <InputField
        autoComplete="email"
        dataCy="user-email-input"
        defaultValue={values.email}
        disabled={disabled}
        error={errors?.email}
        icon={
          <AtSymbolIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent" />
        }
        id={emailId}
        label="Email address"
        name="email"
        placeholder="steve@jobs.com"
        required={true}
        type="email"
      />

      {showPassword && (
        <InputField
          autoComplete="off"
          dataCy="user-password-input"
          describedById="user-password-errors"
          disabled={disabled}
          error={errors?.password}
          icon={
            <LockClosedIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent" />
          }
          id={passwordId}
          label="Password"
          name="password"
          placeholder="Enter your password"
          required={!isEdit}
          type="password"
        />
      )}
      <UserRoleSelect
        dataCy="user-role-select"
        defaultValue={values.role}
        disabled={disabled}
        error={errors?.role}
      />
    </>
  );
}
