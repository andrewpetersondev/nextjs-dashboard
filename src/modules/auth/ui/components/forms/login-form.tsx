"use client";
import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { type FC, type JSX, useActionState, useId } from "react";
import {
  LOGIN_FIELDS_LIST,
  type LoginField,
} from "@/modules/auth/domain/user/schema/auth.schema";
import { AuthActionsRow } from "@/modules/auth/ui/components/shared/auth-actions-row";
import { FormRowWrapper } from "@/modules/auth/ui/components/shared/form-row.wrapper";
import { createInitialFailedFormState } from "@/shared/forms/infrastructure/create-initial-form-state";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { getFieldErrors } from "@/shared/forms/utilities/get-field-errors";
import { getFieldValues } from "@/shared/forms/utilities/get-field-values";
import { FormAlert } from "@/ui/molecules/form-alert";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";

const INITIAL_STATE =
  createInitialFailedFormState<LoginField>(LOGIN_FIELDS_LIST);

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
        <InputFieldMolecule
          autoComplete="email"
          autoFocus={true}
          dataCy="login-email-input"
          defaultValue={values?.email}
          describedById={`${emailId}-errors`}
          error={fieldErrors?.email}
          icon={
            <AtSymbolIcon aria-hidden="true" className={INPUT_ICON_CLASS} />
          }
          id={emailId}
          label="Email address"
          name="email"
          placeholder="steve@jobs.com"
          required={true}
          type="email"
        />
        <InputFieldMolecule
          autoComplete="current-password"
          dataCy="login-password-input"
          describedById={`${passwordId}-errors`}
          error={fieldErrors?.password}
          icon={
            <LockClosedIcon aria-hidden="true" className={INPUT_ICON_CLASS} />
          }
          id={passwordId}
          label="Password"
          name="password"
          placeholder="Enter your password"
          required={true}
          type="password"
        />
        <FormRowWrapper>
          <AuthActionsRow />
        </FormRowWrapper>
        <SubmitButtonMolecule
          data-cy="login-submit-button"
          fullWidth={true}
          label="Log In"
          pending={pending}
        />
      </form>
      {state.ok
        ? state.value.message && (
            <FormAlert
              dataCy="auth-server-message"
              message={state.value.message}
              type="success"
            />
          )
        : state.error.message && (
            <FormAlert
              dataCy="auth-server-message"
              message={state.error.message}
              type="error"
            />
          )}
    </>
  );
};
