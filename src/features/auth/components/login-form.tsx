"use client";

import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { type FC, useActionState, useId } from "react";
import { AuthActionsRow } from "@/features/auth/components/auth-actions-row";
import { AuthServerMessage } from "@/features/auth/components/auth-server-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { type LoginField, LoginSchema } from "@/features/auth/lib/auth.schema";
import type { FormResult } from "@/shared/forms/core/types";
import { createInitialFailedFormStateFromSchema } from "@/shared/forms/state/initial-state";
import { FormInputWrapper } from "@/ui/molecules/form-input-wrapper";
import { InputField } from "@/ui/molecules/input-field";

const INITIAL_STATE = createInitialFailedFormStateFromSchema(LoginSchema);

const iconClass = "pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent";

interface LoginFormProps {
  action: (
    prevState: FormResult<LoginField, unknown>,
    formData: FormData,
  ) => Promise<FormResult<LoginField, unknown>>;
}

/**
 * LoginForm component for user authentication.
 */
export const LoginForm: FC<LoginFormProps> = ({
  action,
}: LoginFormProps): JSX.Element => {
  const [state, boundAction, pending] = useActionState<
    FormResult<LoginField, unknown>,
    FormData
  >(action, INITIAL_STATE);
  const baseId = useId();
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;
  const values = state.ok ? undefined : state.error.values;

  return (
    <>
      <form
        action={boundAction}
        aria-label="Login form"
        autoComplete="off"
        className="space-y-6"
        data-cy="login-form"
      >
        <InputField
          autoComplete="email"
          autoFocus={true}
          dataCy="login-email-input"
          defaultValue={values?.email}
          describedById={`${emailId}-errors`}
          error={state.ok ? undefined : state.error.fieldErrors.email}
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
          error={state.ok ? undefined : state.error.fieldErrors.password}
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
      {state.ok
        ? state.value.message && (
            <AuthServerMessage message={state.value.message} />
          )
        : state.error.message && (
            <AuthServerMessage message={state.error.message} />
          )}
    </>
  );
};
