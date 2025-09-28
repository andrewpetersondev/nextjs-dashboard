"use client";

import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";
import { type FC, useActionState, useId } from "react";
import { AuthActionsRow } from "@/features/auth/components/auth-actions-row";
import { AuthServerMessage } from "@/features/auth/components/auth-server-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import {
  type LoginFormFieldNames,
  LoginFormSchema,
} from "@/features/auth/lib/auth.schema";
import { buildInitialFailedFormStateFromSchema } from "@/shared/forms/mapping/error-mapping";
import type { FormState } from "@/shared/forms/types/form-state";
import { FormInputWrapper } from "@/ui/molecules/form-input-wrapper";
import { InputField } from "@/ui/molecules/input-field";

const INITIAL_STATE = buildInitialFailedFormStateFromSchema(LoginFormSchema);

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
  const baseId = useId();
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;
  // Narrow once: values only exist on failure states
  const values = state.success ? undefined : state.values;

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
