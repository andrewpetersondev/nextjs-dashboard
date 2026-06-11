"use client";
import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { type JSX, useActionState, useId } from "react";
import { AuthFormFeedback } from "@/modules/auth/presentation/authn/components/shared/feedback/auth-form-feedback";
import { AuthActionsRow } from "@/modules/auth/presentation/authn/components/shared/wrappers/auth-actions-row";
import { FormRowWrapper } from "@/modules/auth/presentation/authn/components/shared/wrappers/form-row.wrapper";
import type { AuthActionProps } from "@/modules/auth/presentation/authn/transports/auth-action-props.transport";
import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import type { FormState } from "@/shared/forms/core/types/form-result.dto";
import {
	extractFieldErrors,
	extractFieldValues,
} from "@/shared/forms/logic/inspectors/form-error.inspector";
import { InputFieldMolecule } from "@/ui/molecules/input-field.molecule";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";
import { INPUT_ICON_CLASS } from "@/ui/styles/icons.tokens";

/**
 * LoginForm component for user authentication.
 * Follows Hexagonal Adapter pattern for UI boundaries.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: login boundary handles orchestration of multiple field types
export function LoginForm({
	action,
}: AuthActionProps<LoginField>): JSX.Element {
	const [state, boundAction, pending] = useActionState<
		FormState<never>,
		FormData
	>(action, null);

	const baseId = useId();
	const emailId = `${baseId}-email`;
	const passwordId = `${baseId}-password`;

	// Extract form details safely from AppError; idle (null) has none.
	const failure = state && !state.ok ? state : undefined;
	const fieldErrors = failure ? extractFieldErrors(failure.error) : undefined;
	const values = failure ? extractFieldValues(failure.error) : undefined;

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
					data-cy="login-submit-button"
					fullWidth={true}
					label="Log In"
					pending={pending}
				/>
			</form>

			<AuthFormFeedback state={state} />
		</>
	);
}
