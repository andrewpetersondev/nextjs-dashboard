"use client";

import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { type JSX, useActionState, useId } from "react";
import {
  SIGNUP_FIELDS_LIST,
  type SignupField,
} from "@/modules/auth/shared/domain/user/auth.schema";
import type { AuthActionProps } from "@/modules/auth/ui/components/auth-ui.dto";
import { AuthActionsRow } from "@/modules/auth/ui/components/shared/auth-actions-row";
import { AuthFormFeedback } from "@/modules/auth/ui/components/shared/auth-form-feedback";
import { FormRowWrapper } from "@/modules/auth/ui/components/shared/form-row.wrapper";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { makeInitialFailedFormState } from "@/shared/forms/logic/factories/form-state.factory";
import {
  extractFieldErrors,
  extractFieldValues,
} from "@/shared/forms/logic/inspectors/form-error.inspector";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";

const INITIAL_STATE =
  makeInitialFailedFormState<SignupField>(SIGNUP_FIELDS_LIST);

/**
 * SignupForm component for user registration.
 * Follows Hexagonal Adapter pattern for UI boundaries.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: signup boundary handles orchestration of multiple field types
export function SignupForm({
  action,
}: AuthActionProps<SignupField>): JSX.Element {
  const [state, boundAction, pending] = useActionState<
    FormResult<SignupField>,
    FormData
  >(action, INITIAL_STATE);

  const baseId = useId();
  const usernameId = `${baseId}-username`;
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;

  // Extract form details safely from AppError
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
          defaultValue={values ? values.username : undefined}
          describedById={`${usernameId}-errors`}
          error={fieldErrors ? fieldErrors.username : undefined}
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
          autoFocus={true}
          dataCy="signup-email-input"
          defaultValue={values ? values.email : undefined}
          describedById={`${emailId}-errors`}
          error={fieldErrors ? fieldErrors.email : undefined}
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
          error={fieldErrors ? fieldErrors.password : undefined}
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

      <AuthFormFeedback state={state} />
    </>
  );
}
