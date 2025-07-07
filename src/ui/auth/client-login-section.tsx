"use client";

import type { FC } from "react";
import { AuthSwitchLink } from "@/src/ui/auth/auth-switch-link";
import { LoginForm } from "@/src/ui/auth/login-form";
import { LoginFormDivider } from "@/src/ui/auth/login-form-divider.tsx";
import { LoginFormSocialSection } from "@/src/ui/auth/login-form-social-section";

/**
 * Client-only section for the login page.
 * Renders the login form, social login, and switch link.
 */
export const ClientLoginSection: FC = () => (
	<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
		<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
			<LoginForm />
			<LoginFormDivider />
			<LoginFormSocialSection />
		</div>
		{/* Switch link below the card, matching signup page */}
		<AuthSwitchLink
			href="/signup"
			linkText="Sign up here"
			prompt="Not a member?"
		/>
	</div>
);
