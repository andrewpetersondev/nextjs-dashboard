"use client";

import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { type FC, type JSX, useActionState, useId } from "react";
import {
  SIGNUP_FIELDS_LIST,
  type SignupField,
} from "@/modules/auth/shared/domain/user/auth.schema";
import { AuthActionsRow } from "@/modules/auth/ui/components/shared/auth-actions-row";
import { FormRowWrapper } from "@/modules/auth/ui/components/shared/form-row.wrapper";
import {
  extractFieldErrors,
  extractFieldValues,
} from "@/shared/forms/infrastructure/form-error-inspector";
import { createInitialFailedFormState } from "@/shared/forms/infrastructure/initial-form-state";
import type { FormAction } from "@/shared/forms/types/form-action.dto";
import type { FormResult } from "@/shared/forms/types/form-result.dto";
import { FormAlert } from "@/ui/molecules/form-alert";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";

const INITIAL_STATE =
  createInitialFailedFormState<SignupField>(SIGNUP_FIELDS_LIST);

interface SignupFormProps {
  action: FormAction<SignupField>;
}

interface SignupFormFeedbackProps {
  state: FormResult<SignupField>;
}

function SignupFormFeedback({
  state,
}: SignupFormFeedbackProps): JSX.Element | null {
  if (state.ok) {
    return state.value.message ? (
      <FormAlert
        dataCy="auth-server-message"
        message={state.value.message}
        type="success"
      />
    ) : null;
  }

  return state.error.message ? (
    <FormAlert
      dataCy="auth-server-message"
      message={state.error.message}
      type="error"
    />
  ) : null;
}

/**
 * SignupForm component for user registration.
 * Follows Hexagonal Adapter pattern for UI boundaries.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
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

  const fieldErrors = state.ok ? undefined : extractFieldErrors(state.error);
  const values = state.ok ? undefined : extractFieldValues(state.error);

  return (
    <>
      <form
        action={boundAction}
        aria-label="Signup form"
        autoComplete="off"
        className="space-y-6"
        data-cy="signup-form"
      >
        <InputFieldMolecule
          autoComplete="username"
          autoFocus={true}
          dataCy="signup-username-input"
          defaultValue={values?.username}
          describedById={`${usernameId}-errors`}
          error={fieldErrors?.username}
          icon={<UserIcon aria-hidden="true" className={INPUT_ICON_CLASS} />}
          id={usernameId}
          label="Username"
          name="username"
          placeholder="Enter your username"
          required={true}
          type="text"
        />
        <InputFieldMolecule
          autoComplete="email"
          dataCy="signup-email-input"
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
          autoComplete="new-password"
          dataCy="signup-password-input"
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
          data-cy="signup-submit-button"
          fullWidth={true}
          label="Sign Up"
          pending={pending}
        />
      </form>
      <SignupFormFeedback state={state} />
    </>
  );
};
