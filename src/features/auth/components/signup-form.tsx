"use client";

import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { type FC, type JSX, useActionState } from "react";
import { AuthServerMessage } from "@/features/auth/components/auth-server-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { ForgotPasswordLink } from "@/features/auth/components/forgot-password-link";
import { RememberMeCheckbox } from "@/features/auth/components/remember-me-checkbox";
import type { SignupFormFieldNames } from "@/features/auth/types";
import { signup } from "@/server/auth/actions/signup";
import type { FormFieldError, FormState } from "@/shared/forms/types";
import { FormInputWrapper } from "@/ui/form-input-wrapper";
import { InputField } from "@/ui/input-field";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <TEMP>
export const SignupForm: FC = (): JSX.Element => {
  const initialState: Extract<
    FormState<SignupFormFieldNames>,
    { success: false }
  > = {
    errors: {} as Partial<Record<SignupFormFieldNames, FormFieldError>>,
    message: "",
    success: false, // literal false due to the annotation
  };

  const [state, action, pending] = useActionState<
    FormState<SignupFormFieldNames>,
    FormData
  >(signup, initialState);

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

        <FormInputWrapper>
          <div className="flex items-center justify-between">
            <RememberMeCheckbox />
            <ForgotPasswordLink />
          </div>
        </FormInputWrapper>

        <AuthSubmitButton data-cy="signup-submit-button" pending={pending}>
          Sign Up
        </AuthSubmitButton>
      </form>

      {state.message && <AuthServerMessage message={state.message} />}
    </>
  );
};
