"use client";

import { Button } from "@/src/ui/button";
import { useActionState } from "react";
import { login } from "@/src/server-actions/users";
import Link from "next/link";
import React from "react";
import { EmailField } from "@/src/ui/auth/email-field";
import { PasswordField } from "@/src/ui/auth/password-field";
import { SocialLoginButton } from "@/src/ui/auth/social-login-button";
import { GoogleIcon, GitHubIcon } from "@/src/ui/auth/icons";
import Heading from "@/src/ui/auth/heading";
import NotAMember from "@/src/ui/auth/not-a-member";
import { InputField } from "@/src/ui/auth/input-field";
import { AtSymbolIcon } from "@heroicons/react/24/outline";

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
			{/* Logo and heading */}
			<Heading text="Log in to your account" />

			{/* Form and social logins */}
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
				<div className="bg-bg-secondary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">

					{/* Form */}
					<form action={action} className="space-y-6" noValidate>
						{/* this one should be for email */}
						<InputField id="email" name="email" type="email" label="Email" autoComplete="email" required icon={<AtSymbolIcon />} error={state?.errors?.email} data-cy="login-email-input" placeholder="you@example.com" />
						<EmailField error={state?.errors?.email} />
						<PasswordField errors={state?.errors?.password} />

						{/* Remember Me and Forgot Password */}
						<div className="flex items-center justify-between">
							<div className="flex gap-3">
								<div className="flex h-6 shrink-0 items-center">
									<div className="group grid size-4 grid-cols-1">
										<input
											id="remember-me"
											name="remember-me"
											type="checkbox"
											className="border-bg-accent bg-bg-accent text-bg-active focus:ring-bg-focus col-start-1 row-start-1 h-4 w-4 rounded"
										/>
										<svg
											fill="none"
											viewBox="0 0 14 14"
											className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 group-has-[:checked]:opacity-100"
										>
											<title>Checkmark</title>
											<path
												d="M3 8L6 11L11 3.5"
												strokeWidth={2}
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>
								</div>
								<label
									htmlFor="remember-me"
									className="text-text-primary block text-sm/6"
								>
									Remember me
								</label>
							</div>
							<div className="text-sm/6">
								<Link
									href="/forgot-password"
									className="text-text-secondary hover:text-text-hover font-semibold"
								>
									Forgot password?
								</Link>
							</div>
						</div>

						{/* Submit button */}
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

					{/* Error message */}
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

					{/* Or continue with */}
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
