"use client";

import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { type FC, type JSX, useActionState, useId } from "react";
import {
  LOGIN_FIELDS_LIST,
  type LoginField,
} from "@/modules/auth/shared/domain/user/auth.schema";
import type { AuthActionProps } from "@/modules/auth/ui/components/auth-ui.dto";
import { AuthActionsRow } from "@/modules/auth/ui/components/shared/auth-actions-row";
import { AuthFormFeedback } from "@/modules/auth/ui/components/shared/auth-form-feedback";
import { FormRowWrapper } from "@/modules/auth/ui/components/shared/form-row.wrapper";
import {
  extractFieldErrors,
  extractFieldValues,
} from "@/shared/forms/infrastructure/form-error-inspector";
import { createInitialFailedFormState } from "@/shared/forms/infrastructure/initial-form-state";
import type { FormResult } from "@/shared/forms/types/form-result.dto";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";

const INITIAL_STATE =
  createInitialFailedFormState<LoginField>(LOGIN_FIELDS_LIST);

/**
 * LoginForm component for user authentication.
 * Follows Hexagonal Adapter pattern for UI boundaries.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: login boundary handles orchestration of multiple field types
export const LoginForm: FC<AuthActionProps<LoginField>> = ({
  action,
}: AuthActionProps<LoginField>): JSX.Element => {
  const [state, boundAction, pending] = useActionState<
    FormResult<LoginField>,
    FormData
  >(action, INITIAL_STATE);

  const baseId = useId();
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;

  // Extract form details safely from AppError
  const fieldErrors = state.ok ? undefined : extractFieldErrors(state.error);
  const values = state.ok ? undefined : extractFieldValues(state.error);

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

      <AuthFormFeedback state={state} />
    </>
  );
};
