"use client";

import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { type JSX, useActionState } from "react";
import { login } from "@/src/lib/server-actions/users.ts";
import { AuthSubmitButton } from "@/src/ui/auth/auth-submit-button.tsx";
import { AuthSwitchLink } from "@/src/ui/auth/auth-switch-link.tsx";
import { DemoAdminUser } from "@/src/ui/auth/demo-admin-user.tsx";
import { DemoUser } from "@/src/ui/auth/demo-user.tsx";
import { ForgotPasswordLink } from "@/src/ui/auth/forgot-password-link.tsx";
import { Heading } from "@/src/ui/auth/heading.tsx";
import { InputField } from "@/src/ui/auth/input-field.tsx";
import { RememberMeCheckbox } from "@/src/ui/auth/remember-me-checkbox.tsx";
import { SocialLoginButton } from "@/src/ui/auth/social-login-button.tsx";

type LoginState = {
	errors?: {
		email?: string[];
		password?: string[];
	};
	message?: string;
};

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

						<div className="flex items-center justify-between">
							<RememberMeCheckbox />
							<ForgotPasswordLink />
						</div>

						<div>
							<AuthSubmitButton data-cy="login-submit-button" pending={pending}>
								Log In
							</AuthSubmitButton>
						</div>
					</form>
					{/* does this error div ever get used? */}
					<div
						aria-atomic="true"
						aria-live="polite"
						className="flex h-8 items-end space-x-1"
					>
						{state?.message && (
							<p className="text-text-error" data-cy="login-message-errors">
								{state.message}
							</p>
						)}
					</div>
					{/* does this error div ever get used? */}

					<div>
						<div className="relative mt-10">
							<div
								aria-hidden="true"
								className="absolute inset-0 flex items-center"
							>
								<div className="border-bg-accent w-full border-t" />
							</div>
							<div className="relative flex justify-center text-sm/6 font-medium">
								<span className="bg-bg-primary text-text-secondary px-6">
									Or continue with
								</span>
							</div>
						</div>
						<DemoUser text="Login as Demo User" />
						<DemoAdminUser text="Login as Demo Admin" />
						<div className="mt-6 grid grid-cols-2 gap-4">
							<SocialLoginButton
								data-cy="login-google"
								href="/api/auth/google"
								mode="login"
								provider="Google"
							/>
							<SocialLoginButton
								data-cy="login-github"
								href="/api/auth/github"
								mode="login"
								provider="GitHub"
							/>
						</div>
					</div>
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
