"use client";
import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { type FC, type JSX, useActionState, useId } from "react";
import { AuthActionsRow } from "@/modules/auth/components/auth-actions-row";
import { AuthServerMessage } from "@/modules/auth/components/auth-server-message";
import { AuthSubmitButton } from "@/modules/auth/components/auth-submit-button";
import {
  SIGNUP_FIELDS_LIST,
  type SignupField,
} from "@/modules/auth/lib/auth.schema";
import type { FormResult } from "@/modules/forms/domain/types/form-result.types";
import { createInitialFailedFormState } from "@/modules/forms/infrastructure/create-initial-form-state";
import { getFieldErrors } from "@/modules/forms/use-cases/get-field-errors";
import { getFieldValues } from "@/modules/forms/use-cases/get-field-values";
import { FormInputWrapper } from "@/ui/molecules/form-input-wrapper";
import { InputField } from "@/ui/molecules/input-field";

const INITIAL_STATE =
  createInitialFailedFormState<SignupField>(SIGNUP_FIELDS_LIST);

const iconClass = "pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent";

interface SignupFormProps {
  action: (
    _prevState: FormResult<SignupField>,
    formData: FormData,
  ) => Promise<FormResult<SignupField>>;
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <function is short and maintainable>
export const SignupForm: FC<SignupFormProps> = ({
  action,
}: SignupFormProps): JSX.Element => {
  const [state, boundAction, pending] = useActionState<
    FormResult<SignupField>,
    FormData
  >(action, INITIAL_STATE);

  const baseId = useId();
  const usernameId = `${baseId}-username`;
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;

  const fieldErrors = state.ok
    ? undefined
    : getFieldErrors<SignupField>(state.error);

  const values = state.ok
    ? undefined
    : getFieldValues<SignupField>(state.error);

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
          error={fieldErrors?.username}
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
          error={fieldErrors?.email}
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
          error={fieldErrors?.password}
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
