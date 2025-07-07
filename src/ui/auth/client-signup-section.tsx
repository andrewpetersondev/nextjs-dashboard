"use client";

import type { FC } from "react";
import { AuthFormDivider } from "@/src/ui/auth/auth-form-divider";
import { AuthFormSocialSection } from "@/src/ui/auth/auth-form-social-section";
import { AuthSwitchLink } from "@/src/ui/auth/auth-switch-link";
import { SignupForm } from "@/src/ui/auth/signup-form";

/**
 * Client-only section for the signup page.
 * Renders the signup form, social signup, and switch link.
 */
export const ClientSignupSection: FC = () => (
	<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
		<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
			<SignupForm />
			<AuthFormDivider label="or continue with" />
			<AuthFormSocialSection
				demoAdminText="Signup as Demo Admin"
				demoUserText="Signup as Demo User"
				mode="signup"
			/>
		</div>
		{/* Switch the link below the card, matching the signup page */}
		<AuthSwitchLink
			href="/login"
			linkText="Log in here"
			prompt="Already a member?"
		/>
	</div>
);
