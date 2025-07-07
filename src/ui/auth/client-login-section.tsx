"use client";

import type { FC } from "react";
import { AuthFormDivider } from "@/src/ui/auth/auth-form-divider";
import { AuthFormSocialSection } from "@/src/ui/auth/auth-form-social-section";
import { AuthSwitchLink } from "@/src/ui/auth/auth-switch-link";
import { LoginForm } from "@/src/ui/auth/login-form";

/**
 * Client-only section for the login page.
 * Renders the login form, social login, and switch link.
 */
export const ClientLoginSection: FC = () => (
	<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
		<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
			<LoginForm />
			<AuthFormDivider label="or continue with" />
			<AuthFormSocialSection
				demoAdminText="Login as Demo Admin"
				demoUserText="Login as Demo User"
				mode="login"
			/>
		</div>
		{/* Switch the link below the card, matching the signup page */}
		<AuthSwitchLink
			href="/signup"
			linkText="Sign up here"
			prompt="Not a member?"
		/>
	</div>
);
