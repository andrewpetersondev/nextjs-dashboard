import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import type { JSX } from "react";
import type { FormFieldError } from "@/shared/forms/types";
import { InputField } from "@/ui/input-field";

type ErrorType = {
  username?: FormFieldError;
  email?: FormFieldError;
  role?: FormFieldError;
  password?: FormFieldError;
};

type FieldsProps = {
  values?: Partial<{
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
  }>;
  errors?: ErrorType;
  showPassword?: boolean;
  isEdit?: boolean;
};

export function UserFields({
  values = {},
  errors,
  showPassword = true,
  isEdit = false,
}: FieldsProps): JSX.Element {
  return (
    <>
      {isEdit && values.id && (
        <input name="id" type="hidden" value={values.id} />
      )}
      <InputField
        autoComplete="username"
        dataCy="user-username-input"
        defaultValue={values.username}
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
        <label className="mb-2 block font-medium text-sm" htmlFor="role">
          Role
        </label>
        <select
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring focus:ring-primary"
          defaultValue={values.role}
          id="role"
          name="role"
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <div aria-atomic="true" aria-live="polite" id="user-role-error">
          {errors?.role?.map((error) => (
            <p className="mt-2 text-sm text-text-error" key={error}>
              {error}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
