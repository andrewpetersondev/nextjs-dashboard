"use client";

import { login } from "@/server-actions/users";
import { InputField } from "@/ui/auth/input-field";
import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { RememberMeCheckbox } from "@/ui/auth/remember-me-checkbox";
import { ForgotPasswordLink } from "@/ui/auth/forgot-password-link";
import { SocialLoginButton } from "@/ui/auth/social-login-button";
import Heading from "@/ui/auth/heading";
import { AuthSubmitButton } from "@/ui/auth/auth-submit-button";
import { useActionState } from "react";
import React from "react";
import AuthSwitchLink from "@/ui/auth/auth-switch-link";
import DemoUser from "@/ui/auth/demo-user";

type LoginState = {
	errors?: {
		email?: string[];
		password?: string[];
	};
	message?: string;
} | undefined;

export default function LoginForm() {
	const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);

	return (
		<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
			<Heading text="Log in to your account" />

			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
				<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
					<form action={action} className="space-y-6" noValidate>
						<InputField
							id="email"
							name="email"
							type="email"
							label="Email address"
							autoComplete="email"
							required
							icon={<AtSymbolIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />}
							error={state?.errors?.email}
							dataCy="login-email-input"
							placeholder="steve@jobs.com"
						/>
						<InputField
							id="password"
							name="password"
							type="password"
							label="Password"
							autoComplete="current-password"
							required
							icon={<LockClosedIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />}
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
							<AuthSubmitButton
								pending={pending}
								data-cy="login-button"
							>
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
