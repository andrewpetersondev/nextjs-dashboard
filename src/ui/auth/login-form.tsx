"use client";

import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { type FC, useActionState } from "react";
import { login } from "@/server/users/actions";
import type { LoginFormFieldNames } from "@/server/users/types";
import type { FormState } from "@/shared/forms/types";
import { AuthServerMessage } from "@/ui/auth/auth-server-message";
import { AuthSubmitButton } from "@/ui/auth/auth-submit-button";
import { ForgotPasswordLink } from "@/ui/auth/forgot-password-link";
import { InputField } from "@/ui/auth/input-field";
import { RememberMeCheckbox } from "@/ui/auth/remember-me-checkbox";
import { FormInputWrapper } from "@/ui/form-input-wrapper";

// Define the initial state with strict typing
const initialState: FormState<LoginFormFieldNames> = {
  errors: {},
  message: "",
  success: false,
};

/**
 * LoginForm component for user authentication.
 *
 * @returns {JSX.Element} Rendered LoginForm component.
 */
export const LoginForm: FC = (): JSX.Element => {
  // useActionState returns a tuple: [state, action, pending]
  const [state, action, pending] = useActionState<
    FormState<LoginFormFieldNames>,
    FormData
  >(login, initialState);

  return (
    <>
      <form action={action} aria-label="Login form" className="space-y-6">
        <InputField
          autoComplete="email"
          autoFocus
          dataCy="login-email-input"
          describedById="login-email-errors"
          error={state?.errors?.email}
          icon={
            <AtSymbolIcon
              aria-hidden="true"
              className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent"
            />
          }
          id="email"
          label="Email address"
          name="email"
          placeholder="steve@jobs.com"
          required
          type="email"
        />
        <InputField
          autoComplete="current-password"
          dataCy="login-password-input"
          describedById="login-password-errors"
          error={state?.errors?.password}
          icon={
            <LockClosedIcon
              aria-hidden="true"
              className="pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent"
            />
          }
          id="password"
          label="Password"
          name="password"
          placeholder="Enter your password"
          required
          type="password"
        />

        <FormInputWrapper>
          <div className="flex items-center justify-between">
            <RememberMeCheckbox />
            <ForgotPasswordLink />
          </div>
        </FormInputWrapper>

        <AuthSubmitButton data-cy="login-submit-button" pending={pending}>
          Log In
        </AuthSubmitButton>
      </form>

      {/* Show server message if present */}
      {state.message && <AuthServerMessage message={state.message} />}
    </>
  );
};
