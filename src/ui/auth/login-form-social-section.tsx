"use client";

import type { FC } from "react";
import { DemoAdminUser } from "@/src/ui/auth/demo-admin-user";
import { DemoUser } from "@/src/ui/auth/demo-user";
import { SocialLoginButton } from "@/src/ui/auth/social-login-button";

/**
 * Social login section for the login form.
 * Includes demo user buttons and social login providers.
 */
export const LoginFormSocialSection: FC = () => (
	<div>
		<div className="relative mt-10">
			<div aria-hidden="true" className="absolute inset-0 flex items-center">
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
);
