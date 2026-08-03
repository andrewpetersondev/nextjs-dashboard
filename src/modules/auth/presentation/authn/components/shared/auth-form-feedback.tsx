import type { JSX } from "react";
import type { FormState } from "@/shared/forms/core/types/form-result.dto";
import { FormAlertMolecule } from "@/ui/molecules/form-alert.molecule";

interface AuthFormFeedbackProps<F> {
	readonly state: FormState<F>;
}

/**
 * Shared server feedback for auth forms.
 * At idle (`state === null`) it mounts the empty alert container — the live
 * region must exist before the first message for screen readers to announce
 * it — otherwise a success or error message from the FormResult.
 */
export function AuthFormFeedback<F>({
	state,
}: AuthFormFeedbackProps<F>): JSX.Element {
	if (state === null) {
		return <FormAlertMolecule />;
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
