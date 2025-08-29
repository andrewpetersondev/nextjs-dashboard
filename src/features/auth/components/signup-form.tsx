"use client";

import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { type FC, type JSX, useActionState, useId } from "react";
import { AuthActionsRow } from "@/features/auth/components/auth-actions-row";
import { AuthServerMessage } from "@/features/auth/components/auth-server-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { signup } from "@/server/auth/actions/signup";
import type { SignupFormFieldNames } from "@/shared/auth/schema.shared";
import type { FormFieldError, FormState } from "@/shared/forms/types";
import { FormInputWrapper } from "@/ui/forms/form-input-wrapper";
import { InputField } from "@/ui/forms/input-field";

const INITIAL_STATE = {
  errors: {} as Partial<Record<SignupFormFieldNames, FormFieldError>>,
  message: "",
  success: false,
} satisfies Extract<FormState<SignupFormFieldNames>, { success: false }>;

const iconClass = "pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export const SignupForm: FC = (): JSX.Element => {
  const [state, action, pending] = useActionState<
    FormState<SignupFormFieldNames>,
    FormData
  >(signup, INITIAL_STATE);
  const baseId = useId();
  const usernameId = `${baseId}-username`;
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;
  const passwordErrorsId = `${baseId}-password-errors`;
  // Narrow once: values only exist on failure states
  const values = state.success ? undefined : state.values;

  return (
    <>
      <form
        action={action}
        autoComplete="off"
        className="space-y-6"
        data-cy="signup-form"
      >
        <InputField
          autoComplete="username"
          dataCy="signup-username-input"
          defaultValue={values?.username}
          error={state?.errors?.username}
          icon={<UserIcon className={iconClass} />}
          id={usernameId}
          label="Username"
          name="username"
          required={true}
          type="text"
        />
        <InputField
          autoComplete="email"
          dataCy="signup-email-input"
          defaultValue={values?.email}
          error={state?.errors?.email}
          icon={<AtSymbolIcon className={iconClass} />}
          id={emailId}
          label="Email address"
          name="email"
          placeholder="steve@jobs.com"
          required={true}
          type="email"
        />
        <InputField
          autoComplete="new-password"
          dataCy="signup-password-input"
          describedById={passwordErrorsId}
          error={state?.errors?.password}
          icon={<LockClosedIcon className={iconClass} />}
          id={passwordId}
          label="Password"
          name="password"
          placeholder="Enter your password"
          required={true}
          type="password"
        />
        <FormInputWrapper>
          <AuthActionsRow />
        </FormInputWrapper>
        <AuthSubmitButton data-cy="signup-submit-button" pending={pending}>
          Sign Up
        </AuthSubmitButton>
      </form>
      {state.message && <AuthServerMessage message={state.message} />}
    </>
  );
};
