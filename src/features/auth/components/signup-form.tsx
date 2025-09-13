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
import type { SignupFormFieldNames } from "@/features/auth/domain/schema.shared";
import type { FormFieldError, FormState } from "@/shared/forms/types";
import { FormInputWrapper } from "@/ui/molecules/form-input-wrapper";
import { InputField } from "@/ui/molecules/input-field";

const INITIAL_STATE = {
  errors: {} as Partial<Record<SignupFormFieldNames, FormFieldError>>,
  message: "",
  success: false,
} satisfies Extract<FormState<SignupFormFieldNames>, { success: false }>;

const iconClass = "pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent";

type SignupAction = (
  prevState: FormState<SignupFormFieldNames>,
  formData: FormData,
) => Promise<FormState<SignupFormFieldNames>>;

interface SignupFormProps {
  action: SignupAction;
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <function is short and maintainable>
export const SignupForm: FC<SignupFormProps> = ({
  action,
}: SignupFormProps): JSX.Element => {
  const [state, boundAction, pending] = useActionState<
    FormState<SignupFormFieldNames>,
    FormData
  >(action, INITIAL_STATE);
  const baseId = useId();
  const usernameId = `${baseId}-username`;
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;
  const values = state.success ? undefined : state.values;

  return (
    <>
      <form
        action={boundAction}
        aria-label="Signup form"
        autoComplete="off"
        className="space-y-6"
        data-cy="signup-form"
      >
        <InputField
          autoComplete="username"
          autoFocus={true}
          dataCy="signup-username-input"
          defaultValue={values?.username}
          describedById={`${usernameId}-errors`}
          error={state?.errors?.username}
          icon={<UserIcon aria-hidden="true" className={iconClass} />}
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
          autoComplete="new-password"
          dataCy="signup-password-input"
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
        <AuthSubmitButton data-cy="signup-submit-button" pending={pending}>
          Sign Up
        </AuthSubmitButton>
      </form>
      {state.message && <AuthServerMessage message={state.message} />}
    </>
  );
};
