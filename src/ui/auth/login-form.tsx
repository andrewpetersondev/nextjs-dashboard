"use client";

import { login } from "@/src/server-actions/users";
import { EmailField } from "@/src/ui/auth/email-field";
import { PasswordField } from "@/src/ui/auth/password-field";
import { RememberMeCheckbox } from "@/src/ui/auth/remember-me-checkbox";
import { ForgotPasswordLink } from "@/src/ui/auth/forgot-password-link";
import { SocialLoginButton } from "@/src/ui/auth/social-login-button";
import { GitHubIcon, GoogleIcon } from "@/src/ui/auth/icons";
import Heading from "@/src/ui/auth/heading";
import NotAMember from "@/src/ui/auth/not-a-member";
import { Button } from "@/src/ui/button";
import { useActionState } from "react";
import React from "react";

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
				<div className="bg-bg-secondary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
					<form action={action} className="space-y-6" noValidate>
						<EmailField error={state?.errors?.email} />
						<PasswordField error={state?.errors?.password} />

						<div className="flex items-center justify-between">
							<RememberMeCheckbox />
							<ForgotPasswordLink />
						</div>

						<div>
							<Button
								type="submit"
								aria-disabled={pending}
								data-cy="login-button"
								className="bg-bg-active text-text-primary hover:bg-bg-hover focus-visible:outline-bg-focus flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
							>
								Sign in
							</Button>
						</div>
					</form>

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
						<div className="mt-6 grid grid-cols-2 gap-4">
							<SocialLoginButton
								href="/api/auth/google"
								icon={<GoogleIcon />}
								data-cy="login-google"
							>
								Google
							</SocialLoginButton>
							<SocialLoginButton
								href="/api/auth/github"
								icon={<GitHubIcon />}
								data-cy="login-github"
							>
								GitHub
							</SocialLoginButton>
						</div>
					</div>
				</div>
				<NotAMember />
			</div>
		</div>
	);
}
