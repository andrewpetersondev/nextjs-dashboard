"use client";

import type { FC } from "react";
import { AuthSwitchLink } from "@/src/ui/auth/auth-switch-link";
import { LoginForm } from "@/src/ui/auth/login-form";
import { LoginFormSocialSection } from "@/src/ui/auth/login-form-social-section";

/**
 * Client-only section for the login page.
 * Renders the login form, social login, and switch link.
 */
export const ClientLoginSection: FC = () => (
	<>
		{/* Login form with error handling and pending state */}
		<LoginForm />
		{/* Social login and demo user/admin buttons */}
		<LoginFormSocialSection />
		{/* Link to sign up page */}
		<AuthSwitchLink
			href="/signup"
			linkText="Sign up here"
			prompt="Not a member?"
		/>
	</>
);
