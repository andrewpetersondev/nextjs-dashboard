import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { SelectRole } from "@/features/users/components/select-role";
import type { FormFieldError } from "@/shared/forms/types";
import type { UserDto } from "@/shared/users/dto/types";
import type { BaseUserFormFieldNames } from "@/shared/users/schema/schema.shared";
import { InputField } from "@/ui/forms/input-field";
import { Label } from "@/ui/primitives/label";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <1 line over limit>
export function UserFields({
  values = {},
  errors,
  showPassword = true,
  isEdit = false,
  disabled = false,
}: {
  values?: Partial<UserDto> & { password?: string };
  errors?: Partial<Record<BaseUserFormFieldNames, FormFieldError>>;
  showPassword?: boolean;
  isEdit?: boolean;
  disabled?: boolean;
}): JSX.Element {
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
        id="username"
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
        id="email"
        label="Email address"
        name="email"
        placeholder="steve@jobs.com"
        required={true}
        type="email"
      />

      {showPassword && (
        <InputField
          autoComplete={isEdit ? "new-password" : "new-password"}
          dataCy="user-password-input"
          describedById="user-password-errors"
          disabled={disabled}
          error={errors?.password}
          icon={
            <LockClosedIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent" />
          }
          id="password"
          label="Password"
          name="password"
          placeholder="Enter your password"
          required={!isEdit}
          type="password"
        />
      )}
      <div className="mb-4">
        <Label htmlFor="role" text="Role" />
        <SelectRole
          dataCy="user-role-select"
          defaultValue={values.role}
          disabled={disabled}
          error={errors?.role}
        />
      </div>
    </>
  );
}
