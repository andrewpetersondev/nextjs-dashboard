"use client";

import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { type JSX, useActionState, useEffect, useState } from "react";
import { SelectRole } from "@/features/users/components/select-role";
import { ServerMessage } from "@/features/users/components/server-message";
import type {
  CreateUserFormFieldNames,
  CreateUserFormState,
} from "@/features/users/types";
import { createUserAction } from "@/server/users/actions/create";
import { AUTH_ROLES, type AuthRole } from "@/shared/auth/roles";
import type { FormFieldError, FormState } from "@/shared/forms/types";
import { FormActionRow } from "@/ui/form-action-row";
import { FormSubmitButton } from "@/ui/form-submit-button";
import { H1 } from "@/ui/headings";
import { InputField } from "@/ui/input-field";

const TIMER_DELAY = 4000;

export function CreateUserForm(): JSX.Element {
  const initialState: Extract<
    FormState<CreateUserFormFieldNames>,
    { success: false }
  > = {
    errors: {} as Partial<Record<CreateUserFormFieldNames, FormFieldError>>,
    message: "",
    success: false, // literal false due to the annotation
  };

  const [state, action, pending] = useActionState<
    CreateUserFormState,
    FormData
  >(createUserAction, initialState);

  const [showAlert, setShowAlert] = useState(false);

  // Track the selected role in the local state, strictly typed as UserRole
  const [selectedRole, setSelectedRole] = useState<AuthRole | undefined>(
    undefined,
  );

  useEffect(() => {
    if (state.message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), TIMER_DELAY);
      return () => clearTimeout(timer);
    }
    setShowAlert(false);
    return undefined;
  }, [state.message]);

  return (
    <div>
      <H1>Create User Form</H1>

      <section>
        <p>Admins can create users.</p>
      </section>

      <form action={action} autoComplete="off">
        {/* Username Field */}
        <InputField
          autoComplete="username"
          dataCy="signup-username-input"
          error={state?.errors?.username}
          icon={
            <UserIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent" />
          }
          id="username"
          label="Username"
          name="username"
          required={true}
          type="text"
        />

        {/* Email Field */}
        <InputField
          autoComplete="email"
          dataCy="signup-email-input"
          error={state?.errors?.email}
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

        {/* Password Field */}
        <InputField
          autoComplete="new-password"
          dataCy="signup-password-input"
          describedById="signup-password-errors"
          error={state?.errors?.password}
          icon={
            <LockClosedIcon className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent" />
          }
          id="password"
          label="Password"
          name="password"
          placeholder="Enter your password"
          required={true}
          type="password"
        />

        {/* Role Selection */}
        <div className="mb-4">
          <label className="mb-2 block font-medium text-sm" htmlFor="role">
            Role
          </label>
          <SelectRole
            error={state?.errors?.role}
            // Update the selected role state, ensuring type safety
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              const value = event.target.value as AuthRole;
              setSelectedRole(AUTH_ROLES.includes(value) ? value : undefined);
            }}
            value={selectedRole}
          />
        </div>

        {/* Form Action Row */}
        <FormActionRow cancelHref="/dashboard/users">
          <FormSubmitButton
            data-cy="create-user-submit-button"
            pending={pending}
          >
            Create User
          </FormSubmitButton>
        </FormActionRow>
      </form>

      {/* Server Message */}
      <ServerMessage showAlert={showAlert} state={state} />
    </div>
  );
}
