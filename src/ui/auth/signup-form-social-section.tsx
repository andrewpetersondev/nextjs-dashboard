"use client";

import type { FC } from "react";
import { DemoAdminUser } from "@/src/ui/auth/demo-admin-user";
import { DemoUser } from "@/src/ui/auth/demo-user";
import { SocialLoginButton } from "@/src/ui/auth/social-login-button";

/**
 * Social signup section for the signup form.
 * Includes demo user buttons and social signup providers.
 */
export const SignupFormSocialSection: FC = () => (
	<>
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
	</>
);
