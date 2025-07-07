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
	<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
		<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
			{/* Login form */}
			<LoginForm />

			{/* Social/demo section and divider */}
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
							Or continue with
						</span>
					</div>
				</div>
				<LoginFormSocialSection />
			</div>
		</div>
		{/* Switch link below the card, matching signup page */}
		<AuthSwitchLink
			href="/signup"
			linkText="Sign up here"
			prompt="Not a member?"
		/>
	</div>
);
