"use client";
import type { FC, JSX } from "react";
import { useActionState } from "react";
import type {
	FormResult,
	FormState,
} from "@/shared/forms/core/types/form-result.dto";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";

interface DemoFormProps {
	action: (
		_prevState: FormState<never>,
		formData: FormData,
	) => Promise<FormResult<never>>;
	label: string;
	text: string;
}

/**
 * DemoForm component for demo user login buttons.
 * Displays a loading state while the action is pending and error messages on failure.
 */
export const DemoForm: FC<DemoFormProps> = ({
	text,
	label,
	action,
}: DemoFormProps): JSX.Element => {
	const [state, boundAction, pending] = useActionState<
		FormState<never>,
		FormData
	>(action, null);

	return (
		<form action={boundAction} aria-label={label}>
			<SubmitButtonMolecule
				className="mt-2"
				data-cy={`demo-user-button-${label}`}
				fullWidth={true}
				label={text}
				pending={pending}
			/>

			{state && !state.ok && state.error.message && (
				<p className="mt-2 text-sm text-text-error">{state.error.message}</p>
			)}
		</form>
	);
};
