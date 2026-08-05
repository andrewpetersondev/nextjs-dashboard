"use client";
import { AtSymbolIcon } from "@heroicons/react/24/outline";
import { type JSX, useActionState, useId } from "react";
import { AuthFormFeedback } from "@/modules/auth/presentation/authn/components/shared/auth-form-feedback";
import type { ForgotPasswordActionProps } from "@/modules/auth/presentation/authn/transports/auth-action-props.transport";
import { FORGOT_PASSWORD_DEMO_NOTE } from "@/modules/auth/presentation/constants/auth.tokens";
import type { FormState } from "@/shared/forms/core/form-result.dto";
import {
	extractFieldErrors,
	extractFieldValues,
} from "@/shared/forms/logic/form-error.inspector";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";

/**
 * ForgotPasswordForm component for requesting a password reset.
 *
 * On success the form is replaced by the generic confirmation (identical for
 * existing and unknown accounts — ADR 006) plus an honest demo note.
 */
export function ForgotPasswordForm({
	action,
}: ForgotPasswordActionProps): JSX.Element {
	const [state, boundAction, pending] = useActionState<
		FormState<null>,
		FormData
	>(action, null);

	const baseId = useId();
	const emailId = `${baseId}-email`;

	// Extract form details safely from AppError; idle (null) has none.
	const failure = state && !state.ok ? state : undefined;
	const fieldErrors = failure ? extractFieldErrors(failure.error) : undefined;
	const values = failure ? extractFieldValues(failure.error) : undefined;

	if (state?.ok) {
		return (
			<div className="space-y-4" data-cy="forgot-password-confirmation">
				<AuthFormFeedback state={state} />
				<p
					className="text-center text-sm/6 text-text-accent"
					data-cy="forgot-password-demo-note"
				>
					{FORGOT_PASSWORD_DEMO_NOTE}
				</p>
			</div>
		);
	}

	return (
		<>
			<form
				action={boundAction}
				aria-label="Forgot password form"
				autoComplete="off"
				className="space-y-6"
				data-cy="forgot-password-form"
			>
				<InputFieldMolecule
					autoComplete="email"
					autoFocus={true}
					dataCy="forgot-password-email-input"
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
				<SubmitButtonMolecule
					data-cy="forgot-password-submit-button"
					fullWidth={true}
					label="Send reset link"
					pending={pending}
				/>
			</form>

			<AuthFormFeedback state={state} />
		</>
	);
}
