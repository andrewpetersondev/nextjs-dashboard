"use client";

import { signup } from "@/src/lib/server-actions/users";
import { AuthSubmitButton } from "@/src/ui/auth/auth-submit-button";
import DemoAdminUser from "@/src/ui/auth/demo-admin-user";
import DemoUser from "@/src/ui/auth/demo-user";
import { InputField } from "@/src/ui/auth/input-field";
import {
	AtSymbolIcon,
	LockClosedIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import React, { useActionState } from "react";
import type { FC } from "react";
import AuthSwitchLink from "./auth-switch-link";
import { ForgotPasswordLink } from "./forgot-password-link";
import Heading from "./heading";
import { RememberMeCheckbox } from "./remember-me-checkbox";
import { SocialLoginButton } from "./social-login-button";

type SignupFormState = Readonly<{
	errors?: {
		username?: string[];
		email?: string[];
		password?: string[];
	};
	message?: string;
}>;

/**
 * Signup form component.
 * @remarks
 * Production-ready, accessible, and testable signup form for Next.js App Router.
 */
export const SignupForm: FC = () => {
	const [state, action, pending] = useActionState<SignupFormState, FormData>(
		signup,
		{ errors: {}, message: "" },
	);

	return (
		<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
			<Heading text="Sign up for an account" />

			{/* Form container */}
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
				<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
					<form
						action={action}
						data-cy="signup-form"
						className="space-y-6"
						autoComplete="off"
					>
						<InputField
							id="username"
							name="username"
							type="text"
							label="Username"
							autoComplete="username"
							required={true}
							icon={
								<UserIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
							}
							error={state?.errors?.username}
							dataCy="signup-username-input"
						/>
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
							dataCy="signup-email-input"
							placeholder="steve@jobs.com"
						/>
						<InputField
							id="password"
							name="password"
							type="password"
							label="Password"
							autoComplete="new-password"
							required={true}
							icon={
								<LockClosedIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
							}
							error={state?.errors?.password}
							dataCy="signup-password-input"
							placeholder="Enter your password"
							describedById="signup-password-errors"
						/>

						<div className="flex items-center justify-between">
							<RememberMeCheckbox />
							<ForgotPasswordLink />
						</div>

						<div>
							<AuthSubmitButton
								pending={pending}
								data-cy="signup-submit-button"
							>
								Sign Up
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
							<p data-cy="signup-message-errors" className="text-text-error">
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
									Or sign up with
								</span>
							</div>
						</div>
						<DemoUser text="Sign up as Demo User" />
						<DemoAdminUser text="Sign up as Demo Admin" />
						<div className="mt-6 grid grid-cols-2 gap-4">
							<SocialLoginButton
								provider="Google"
								href="/api/auth/google"
								mode="signup"
								data-cy="signup-google"
							/>
							<SocialLoginButton
								provider="GitHub"
								href="/api/auth/github"
								mode="signup"
								data-cy="signup-github"
							/>
						</div>
					</div>
				</div>
				<AuthSwitchLink
					prompt="Already a member?"
					href="/login"
					linkText="Sign in here"
				/>
			</div>
		</div>
	);
};
