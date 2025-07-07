"use client";

import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { type JSX, useActionState } from "react";
import { login } from "@/src/lib/server-actions/users.actions";
import { AuthServerMessage } from "@/src/ui/auth/auth-server-message";
import { AuthSubmitButton } from "@/src/ui/auth/auth-submit-button";
import { AuthSwitchLink } from "@/src/ui/auth/auth-switch-link";
import { ForgotPasswordLink } from "@/src/ui/auth/forgot-password-link";
import { Heading } from "@/src/ui/auth/heading";
import { InputField } from "@/src/ui/auth/input-field";
import { LoginFormSocialSection } from "@/src/ui/auth/login-form-social-section";
import { RememberMeCheckbox } from "@/src/ui/auth/remember-me-checkbox";
import { FormInputWrapper } from "@/src/ui/wrappers/form-input-wrapper";

type LoginState = {
	errors?: {
		email?: string[];
		password?: string[];
	};
	message?: string;
};

/**
 * LoginForm component for user authentication.
 *
 * @returns {JSX.Element} Rendered LoginForm component.
 */
export function LoginForm(): JSX.Element {
	const [state, action, pending] = useActionState<LoginState, FormData>(login, {
		errors: {},
		message: "",
	});

	return (
		<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
			<Heading text="Log in to your account" />

			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
				<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
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

						<div>
							<AuthSubmitButton data-cy="login-submit-button" pending={pending}>
								Log In
							</AuthSubmitButton>
						</div>
					</form>

					<AuthServerMessage message={state.message} />
					<LoginFormSocialSection />
				</div>
				<AuthSwitchLink
					href="/signup"
					linkText="Sign up here"
					prompt="Not a member?"
				/>
			</div>
		</div>
	);
}
