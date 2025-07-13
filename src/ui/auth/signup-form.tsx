"use client";

import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { type FC, type JSX, useActionState } from "react";
import { signup } from "@/features/users/user.actions";
import type { SignupFormFieldNames } from "@/features/users/user.types";
import type { FormState } from "@/lib/forms/form.types";
import { AuthServerMessage } from "@/ui/auth/auth-server-message";
import { AuthSubmitButton } from "@/ui/auth/auth-submit-button";
import { ForgotPasswordLink } from "@/ui/auth/forgot-password-link";
import { InputField } from "@/ui/auth/input-field";
import { RememberMeCheckbox } from "@/ui/auth/remember-me-checkbox";
import { FormInputWrapper } from "@/ui/form-input-wrapper";

const initialState = {
  errors: {},
  message: "",
  success: false,
};

/**
 * SignupForm component for user registration.
 *
 * @remarks
 * Production-ready, accessible, and testable signup form for Next.js App Router.
 *
 * @returns Rendered SignupForm component.
 */
export const SignupForm: FC = (): JSX.Element => {
  const [state, action, pending] = useActionState<
    typeof signup,
    FormState<SignupFormFieldNames>
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
