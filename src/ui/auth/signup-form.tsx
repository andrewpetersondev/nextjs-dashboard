"use client";

import {
	AtSymbolIcon,
	LockClosedIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import type { FC } from "react";
import React, { useActionState } from "react";
import { signup } from "@/src/lib/server-actions/users";
import { AuthSubmitButton } from "@/src/ui/auth/auth-submit-button";
import DemoAdminUser from "@/src/ui/auth/demo-admin-user";
import DemoUser from "@/src/ui/auth/demo-user";
import { InputField } from "@/src/ui/auth/input-field";
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
						autoComplete="off"
						className="space-y-6"
						data-cy="signup-form"
					>
						<InputField
							autoComplete="username"
							dataCy="signup-username-input"
							error={state?.errors?.username}
							icon={
								<UserIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
							}
							id="username"
							label="Username"
							name="username"
							required={true}
							type="text"
						/>
						<InputField
							autoComplete="email"
							dataCy="signup-email-input"
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
							autoComplete="new-password"
							dataCy="signup-password-input"
							describedById="signup-password-errors"
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
							<AuthSubmitButton
								data-cy="signup-submit-button"
								pending={pending}
							>
								Sign Up
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
							<p className="text-text-error" data-cy="signup-message-errors">
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
								data-cy="signup-google"
								href="/api/auth/google"
								mode="signup"
								provider="Google"
							/>
							<SocialLoginButton
								data-cy="signup-github"
								href="/api/auth/github"
								mode="signup"
								provider="GitHub"
							/>
						</div>
					</div>
				</div>
				<AuthSwitchLink
					href="/login"
					linkText="Sign in here"
					prompt="Already a member?"
				/>
			</div>
		</div>
	);
};
