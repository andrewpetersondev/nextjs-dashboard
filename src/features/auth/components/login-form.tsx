"use client";

import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { type FC, useActionState } from "react";
import { AuthServerMessage } from "@/features/auth/components/auth-server-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { ForgotPasswordLink } from "@/features/auth/components/forgot-password-link";
import { RememberMeCheckbox } from "@/features/auth/components/remember-me-checkbox";
import type { LoginFormFieldNames } from "@/features/auth/types";
import type { FormState } from "@/shared/forms/types";
import { FormInputWrapper } from "@/ui/forms/form-input-wrapper";
import { InputField } from "@/ui/forms/input-field";

// Define the initial state with strict typing
const initialState: FormState<LoginFormFieldNames> = {
  errors: {},
  message: "",
  success: false,
};

// Define the action type and component props
type LoginAction = (
  prevState: FormState<LoginFormFieldNames>,
  formData: FormData,
) => Promise<FormState<LoginFormFieldNames>>;

interface LoginFormProps {
  action: LoginAction;
}

/**
 * LoginForm component for user authentication.
 *
 * @returns {JSX.Element} Rendered LoginForm component.
 */
export const LoginForm: FC<LoginFormProps> = ({
  action,
}: LoginFormProps): JSX.Element => {
  // useActionState returns a tuple: [state, boundAction, pending]
  const [state, boundAction, pending] = useActionState<
    FormState<LoginFormFieldNames>,
    FormData
  >(action, initialState);

  return (
    <>
      <form action={boundAction} aria-label="Login form" className="space-y-6">
        <InputField
          autoComplete="email"
          autoFocus={true}
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
          required={true}
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
          required={true}
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
