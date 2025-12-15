"use client";

import type { FC, JSX } from "react";
import { useActionState } from "react";
import type { UserRole } from "@/modules/auth/shared/user/auth.roles";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { formError } from "@/shared/forms/utilities/factories/create-form-result.factory";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";

interface DemoFormProps {
  label: string;
  text: string;
  userRole: UserRole;
  action: (
    _prevState: FormResult<never>,
    formData: FormData,
  ) => Promise<FormResult<never>>;
}

/**
 * DemoForm component for demo user login buttons.
 * Displays a loading state while the action is pending and error messages on failure.
 */
export const DemoForm: FC<DemoFormProps> = ({
  text,
  userRole,
  label,
  action,
}: DemoFormProps): JSX.Element => {
  const initialState: FormResult<never> = formError({
    fieldErrors: {} as Record<string, readonly string[]>,
    message: "",
  });

  const [state, boundAction, pending] = useActionState<
    FormResult<never>,
    FormData
  >(action, initialState);

  return (
    <form action={boundAction} aria-label={label}>
      <input name="role" type="hidden" value={userRole} />

      <SubmitButtonMolecule
        className="mt-2"
        data-cy={`demo-user-button-${label}`}
        fullWidth={true}
        label={text}
        pending={pending}
      />

      {!state.ok && state.error.message && (
        <p className="mt-2 text-sm text-text-error">{state.error.message}</p>
      )}
    </form>
  );
};
