"use client";

import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { type FC, useActionState, useId } from "react";
import { AuthActionsRow } from "@/features/auth/components/auth-actions-row";
import { AuthServerMessage } from "@/features/auth/components/auth-server-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import type { LoginFormFieldNames } from "@/shared/auth/schema.shared";
import type { FormFieldError, FormState } from "@/shared/forms/types";
import { FormInputWrapper } from "@/ui/forms/form-input-wrapper";
import { InputField } from "@/ui/forms/input-field";

const INITIAL_STATE = {
  errors: {} as Partial<Record<LoginFormFieldNames, FormFieldError>>,
  message: "",
  success: false,
} satisfies Extract<FormState<LoginFormFieldNames>, { success: false }>;

const iconClass = "pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent";

type LoginAction = (
  prevState: FormState<LoginFormFieldNames>,
  formData: FormData,
) => Promise<FormState<LoginFormFieldNames>>;

interface LoginFormProps {
  action: LoginAction;
}

/**
 * LoginForm component for user authentication.
 */
export const LoginForm: FC<LoginFormProps> = ({
  action,
}: LoginFormProps): JSX.Element => {
  const [state, boundAction, pending] = useActionState<
    FormState<LoginFormFieldNames>,
    FormData
  >(action, INITIAL_STATE);
  const emailId = useId();
  const passwordId = useId();

  return (
    <>
      <form action={boundAction} aria-label="Login form" className="space-y-6">
        <InputField
          autoComplete="email"
          autoFocus={true}
          dataCy="login-email-input"
          describedById={`${emailId}-errors`}
          error={state?.errors?.email}
          icon={<AtSymbolIcon aria-hidden="true" className={iconClass} />}
          id={emailId}
          label="Email address"
          name="email"
          placeholder="steve@jobs.com"
          required={true}
          type="email"
        />
        <InputField
          autoComplete="current-password"
          dataCy="login-password-input"
          describedById={`${passwordId}-errors`}
          error={state?.errors?.password}
          icon={<LockClosedIcon aria-hidden="true" className={iconClass} />}
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

        <AuthSubmitButton data-cy="login-submit-button" pending={pending}>
          Log In
        </AuthSubmitButton>
      </form>
      {state.message && <AuthServerMessage message={state.message} />}
    </>
  );
};
