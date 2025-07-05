import type { ReactNode } from "react";
import { AuthSwitchLink } from "@/src/ui/auth/auth-switch-link";
import { DemoAdminUser } from "@/src/ui/auth/demo-admin-user";
import { DemoUser } from "@/src/ui/auth/demo-user";
import { Heading } from "@/src/ui/auth/heading";
import { SocialLoginButton } from "@/src/ui/auth/social-login-button";

// Use ReactNode for children to allow fragments, etc.
export interface SignupFormWrapperProps {
	children: ReactNode;
}

/**
 * Wrapper for the signup form page.
 * Handles layout, heading, and container styling.
 * Server-rendered for performance.
 */
export function SignupFormWrapper({ children }: SignupFormWrapperProps) {
	return (
		<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
			<Heading text="Sign up for an account" />
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
				<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
					{children}
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
}
