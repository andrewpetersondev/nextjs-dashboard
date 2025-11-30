"use client";
import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { type FC, type JSX, useActionState, useId } from "react";
import { AuthActionsRow } from "@/features/auth/components/auth-actions-row";
import { AuthServerMessage } from "@/features/auth/components/auth-server-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import {
  LOGIN_FIELDS_LIST,
  type LoginField,
} from "@/features/auth/lib/auth.schema";
import type { FormResult } from "@/shared/forms/domain/types/form-result.types";
import { createInitialFailedFormState } from "@/shared/forms/infrastructure/create-initial-form-state";
import { getFieldErrors } from "@/shared/forms/use-cases/extract-field-errors";
import { getFieldValues } from "@/shared/forms/use-cases/extract-field-values";
import { FormInputWrapper } from "@/ui/molecules/form-input-wrapper";
import { InputField } from "@/ui/molecules/input-field";

const INITIAL_STATE =
  createInitialFailedFormState<LoginField>(LOGIN_FIELDS_LIST);

const iconClass = "pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent";

interface LoginFormProps {
  action: (
    _prevState: FormResult<LoginField>,
    formData: FormData,
  ) => Promise<FormResult<LoginField>>;
}

/**
 * LoginForm component for user authentication.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix immediately>
export const LoginForm: FC<LoginFormProps> = ({
  action,
}: LoginFormProps): JSX.Element => {
  const [state, boundAction, pending] = useActionState<
    FormResult<LoginField>,
    FormData
  >(action, INITIAL_STATE);

  const baseId = useId();
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;

  // Extract form details safely from AppError
  const fieldErrors = state.ok
    ? undefined
    : getFieldErrors<LoginField>(state.error);

  const values = state.ok ? undefined : getFieldValues<LoginField>(state.error);

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
          autoComplete="current-password"
          dataCy="login-password-input"
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
