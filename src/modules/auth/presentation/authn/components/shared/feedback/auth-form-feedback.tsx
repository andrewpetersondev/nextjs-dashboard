import type { JSX } from "react";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { FormAlert } from "@/ui/molecules/form-alert";

interface AuthFormFeedbackProps<F extends string> {
  readonly state: FormResult<F>;
}

/**
 * Shared server feedback for auth forms.
 * Renders a success or error message if present in the FormResult.
 */
export function AuthFormFeedback<F extends string>({
  state,
}: AuthFormFeedbackProps<F>): JSX.Element | null {
  if (state.ok) {
    if (state.value.message === undefined) {
      return null;
    }

    return (
      <FormAlert
        dataCy="auth-server-message-success"
        message={state.value.message}
        type="success"
      />
    );
  }

  if (state.error.message === undefined) {
    return null;
  }

  return (
    <FormAlert
      dataCy="auth-server-message-error"
      message={state.error.message}
      type="error"
    />
  );
}
