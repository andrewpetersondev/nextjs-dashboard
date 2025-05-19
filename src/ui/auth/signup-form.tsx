"use client";

import { Button } from "@/src/ui/button";
import { useActionState } from "react";
import { signup } from "@/src/server-actions/users";
import Link from "next/link";
import { AtSymbolIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { memo } from "react";
import { InputField } from "@/src/ui/auth/input-field";
import AuthSwitchLink from "./auth-switch-link";
import Heading from "./heading";
import { SocialLoginButton } from "./social-login-button";

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
						<InputField
							id="password"
							name="password"
							type="password"
							label="Password"
							autoComplete="new-password"
							required
							icon={<LockClosedIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />}
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


