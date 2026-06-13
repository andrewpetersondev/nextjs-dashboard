import type { JSX } from "react";
import type { FormState } from "@/shared/forms/core/types/form-result.dto";
import { FormAlertMolecule } from "@/ui/molecules/form-alert.molecule";

interface AuthFormFeedbackProps<F extends string> {
	readonly state: FormState<F>;
}

/**
 * Shared server feedback for auth forms.
 * Renders nothing at idle (`state === null`), otherwise a success or error
 * message from the FormResult.
 */
export function AuthFormFeedback<F extends string>({
	state,
}: AuthFormFeedbackProps<F>): JSX.Element | null {
	if (state === null) {
		return null;
	}

	if (state.ok) {
		return (
			<FormAlertMolecule
				dataCy="auth-server-message-success"
				message={state.value.message}
				type="success"
			/>
		);
	}

	return (
		<FormAlertMolecule
			dataCy="auth-server-message-error"
			message={state.error.message}
			type="error"
		/>
	);
}
