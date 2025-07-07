"use client";

import type { FC } from "react";
import { AuthSwitchLink } from "@/src/ui/auth/auth-switch-link";
import { SignupForm } from "@/src/ui/auth/signup-form";
import { SignupFormDivider } from "@/src/ui/auth/signup-form-divider";
import { SignupFormSocialSection } from "@/src/ui/auth/signup-form-social-section";

/**
 * Client-only section for the signup page.
 * Renders the signup form, social signup, and switch link.
 */
export const ClientSignupSection: FC = () => (
	<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
		<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
			<SignupForm />
			<SignupFormDivider />
			<SignupFormSocialSection />
		</div>
		{/* Switch the link below the card, matching the signup page */}
		<AuthSwitchLink
			href="/login"
			linkText="Log in here"
			prompt="Already a member?"
		/>
	</div>
);
