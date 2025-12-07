"use client";
import type { FC, JSX } from "react";
import { useActionState } from "react";
import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import { formError } from "@/shared/forms/utilities/factories/create-form-result.factory";
import { Button } from "@/ui/atoms/button";

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
  // Initial state: empty form-level error with no field errors
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
      {/* Hidden input to pass the role to the server action */}
      <input name="role" type="hidden" value={userRole} />
      <Button
        className="mt-2 flex w-full items-center justify-center gap-3 rounded-md bg-bg-primary px-3 py-2 font-semibold text-sm text-text-primary ring-1 ring-bg-accent hover:bg-bg-accent focus-visible:ring-2 focus-visible:ring-bg-focus"
        data-cy={`demo-user-button-${label}`}
        disabled={pending}
        type="submit"
      >
        {text}
      </Button>
      {/* Show error message if demo user creation failed */}
      {!state.ok && state.error.message && (
        <p className="mt-2 text-sm text-text-error">{state.error.message}</p>
      )}
    </form>
  );
};
