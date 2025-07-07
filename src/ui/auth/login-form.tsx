"use client";

import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { type FC, useActionState } from "react";
import { login } from "@/src/lib/actions/users.actions";
import { AuthServerMessage } from "@/src/ui/auth/auth-server-message";
import { AuthSubmitButton } from "@/src/ui/auth/auth-submit-button";
import { ForgotPasswordLink } from "@/src/ui/auth/forgot-password-link";
import { InputField } from "@/src/ui/auth/input-field";
import { RememberMeCheckbox } from "@/src/ui/auth/remember-me-checkbox";
import { FormInputWrapper } from "@/src/ui/wrappers/form-input-wrapper";

type LoginFormState = Readonly<{
	errors?: {
		email?: string[];
		password?: string[];
	};
	message?: string;
}>;

/**
 * LoginForm component for user authentication.
 *
 * @returns Rendered LoginForm component.
 */
export const LoginForm: FC = () => {
	const [state, action, pending] = useActionState<LoginFormState, FormData>(
		login,
		{
			errors: {},
			message: "",
		},
	);

	return (
		<>
			<form action={action} className="space-y-6">
				<InputField
					autoComplete="email"
					autoFocus={true}
					dataCy="login-email-input"
					describedById="login-email-errors"
					error={state?.errors?.email}
					icon={
						<AtSymbolIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
					}
					id="email"
					label="Email address"
					name="email"
					placeholder="steve@jobs.com"
					required={true}
					type="email"
				/>
				<InputField
					autoComplete="current-password"
					dataCy="login-password-input"
					describedById="login-password-errors"
					error={state?.errors?.password}
					icon={
						<LockClosedIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
					}
					id="password"
					label="Password"
					name="password"
					placeholder="Enter your password"
					required={true}
					type="password"
				/>

				<FormInputWrapper>
					<div className="flex items-center justify-between">
						<RememberMeCheckbox />
						<ForgotPasswordLink />
					</div>
				</FormInputWrapper>

				<AuthSubmitButton data-cy="login-submit-button" pending={pending}>
					Log In
				</AuthSubmitButton>
			</form>

			{state.message && <AuthServerMessage message={state.message} />}
		</>
	);
};
