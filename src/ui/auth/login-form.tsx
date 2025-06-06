"use client";

import { login } from "@/src/server-actions/users";
import { AuthSubmitButton } from "@/src/ui/auth/auth-submit-button";
import AuthSwitchLink from "@/src/ui/auth/auth-switch-link";
import DemoAdminUser from "@/src/ui/auth/demo-admin-user";
import DemoUser from "@/src/ui/auth/demo-user";
import { ForgotPasswordLink } from "@/src/ui/auth/forgot-password-link";
import Heading from "@/src/ui/auth/heading";
import { InputField } from "@/src/ui/auth/input-field";
import { RememberMeCheckbox } from "@/src/ui/auth/remember-me-checkbox";
import { SocialLoginButton } from "@/src/ui/auth/social-login-button";
import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useActionState } from "react";
import React from "react";

type LoginState = {
	errors?: {
		email?: string[];
		password?: string[];
	};
	message?: string;
};

export default function LoginForm() {
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
							id="email"
							name="email"
							type="email"
							label="Email address"
							autoComplete="email"
							required={true}
							icon={
								<AtSymbolIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
							}
							error={state?.errors?.email}
							dataCy="login-email-input"
							describedById="login-email-errors"
							placeholder="steve@jobs.com"
							autoFocus={true}
						/>
						<InputField
							id="password"
							name="password"
							type="password"
							label="Password"
							autoComplete="current-password"
							required={true}
							icon={
								<LockClosedIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
							}
							error={state?.errors?.password}
							dataCy="login-password-input"
							placeholder="Enter your password"
							describedById="login-password-errors"
						/>

						<div className="flex items-center justify-between">
							<RememberMeCheckbox />
							<ForgotPasswordLink />
						</div>

						<div>
							<AuthSubmitButton pending={pending} data-cy="login-submit-button">
								Log In
							</AuthSubmitButton>
						</div>
					</form>
					{/* does this error div ever get used? */}
					<div
						className="flex h-8 items-end space-x-1"
						aria-live="polite"
						aria-atomic="true"
					>
						{state?.message && (
							<p data-cy="login-message-errors" className="text-text-error">
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
								provider="Google"
								href="/api/auth/google"
								mode="login"
								data-cy="login-google"
							/>
							<SocialLoginButton
								provider="GitHub"
								href="/api/auth/github"
								mode="login"
								data-cy="login-github"
							/>
						</div>
					</div>
				</div>
				<AuthSwitchLink
					prompt="Not a member?"
					href="/signup"
					linkText="Sign up here"
				/>
			</div>
		</div>
	);
}
