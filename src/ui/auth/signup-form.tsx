"use client";

import { Button } from "@/src/ui/button";
import { useActionState } from "react";
import { signup } from "@/src/server-actions/users";
import Link from "next/link";
import { AtSymbolIcon, UserIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { memo } from "react";
import { PasswordField } from "@/src/ui/auth/password-field";
import { InputField } from "@/src/ui/auth/input-field";
import AuthSwitchLink from "./auth-switch-link";
import Heading from "./heading";

type SocialButtonProps = Readonly<{
	href: string;
	icon: React.ReactElement;
	children: React.ReactNode;
}>;

/**
 * Social login button.
 */
const SocialButton: FC<SocialButtonProps> = memo(({ href, icon, children }) => (
	<a
		href={href}
		className="bg-bg-primary text-text-primary ring-bg-accent hover:bg-bg-accent focus-visible:ring-bg-focus flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ring-1 focus-visible:ring-2"
		tabIndex={0}
		aria-label={`Sign up with ${typeof children === "string" ? children : "provider"}`}
	>
		{icon}
		<span>{children}</span>
	</a>
));

SocialButton.displayName = "SocialButton";

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
	const [state, action, pending] = useActionState<SignupFormState, FormData>(signup, { errors: undefined, message: undefined });

	return (
		<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">

			<Heading text="Sign up for an account" />

			{/* Form container */}
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
				<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
					<form action={action} className="space-y-6" autoComplete="off" noValidate>
						{/* Username */}
						<InputField
							id="username"
							name="username"
							type="text"
							label="Username"
							autoComplete="username"
							required
							icon={<UserIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />}
							error={state?.errors?.username}
							dataCy="signup-username-input"
						/>
						{/* Email */}
						<InputField
							id="email"
							name="email"
							type="email"
							label="Email address"
							autoComplete="email"
							required
							icon={<AtSymbolIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />}
							error={state?.errors?.email}
							dataCy="signup-email-input"
							placeholder="steve@jobs.com"
						/>
						<PasswordField
							id="password"
							name="password"
							label="Password"
							autoComplete="new-password"
							required
							error={state?.errors?.password}
							dataCy="signup-password-input"
							placeholder="Enter your password"
							describedById="signup-password-errors"
						/>

						<div className="flex items-center justify-between">
							<div className="flex gap-3">
								<div className="flex h-6 shrink-0 items-center">
									<div className="group grid size-4 grid-cols-1">
										<input
											id="remember-me"
											name="remember-me"
											type="checkbox"
											className="border-bg-accent bg-bg-accent text-bg-active focus:ring-bg-focus col-start-1 row-start-1 h-4 w-4 rounded"
											aria-checked="false"
											tabIndex={0}
										/>
										<svg
											fill="none"
											viewBox="0 0 14 14"
											className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 group-has-[:checked]:opacity-100"
											aria-hidden="true"
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

						<div>
							<Button
								type="submit"
								aria-disabled={pending}
								className="bg-bg-active text-text-primary hover:bg-bg-hover focus-visible:outline-bg-focus flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
								data-cy="signup-submit-button"
							>
								Sign up
							</Button>
						</div>
					</form>
					<div
						className="flex h-8 items-end space-x-1"
						aria-live="polite"
						aria-atomic="true"
					>
						{state?.message && (
							<p data-cy="signup-message-errors" className="text-bg-active">
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
									Or sign up with
								</span>
							</div>
						</div>
						<div className="mt-6 grid grid-cols-2 gap-4">
							<SocialButton
								href="#"
								icon={
									<svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
										<title>Google</title>
										<path
											d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
											fill="#EA4335"
										/>
										<path
											d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
											fill="#4285F4"
										/>
										<path
											d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
											fill="#FBBC05"
										/>
										<path
											d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
											fill="#34A853"
										/>
									</svg>
								}
							>
								Google
							</SocialButton>
							<SocialButton
								href="#"
								icon={
									<svg
										fill="currentColor"
										viewBox="0 0 20 20"
										aria-hidden="true"
										className="size-5"
									>
										<title>GitHub</title>
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
										/>
									</svg>
								}
							>
								GitHub
							</SocialButton>
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


