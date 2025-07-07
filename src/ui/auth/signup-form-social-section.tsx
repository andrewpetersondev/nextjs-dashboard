import type { FC } from "react";
import { DemoAdminUser } from "@/src/ui/auth/demo-admin-user";
import { DemoUser } from "@/src/ui/auth/demo-user";
import { SignupFormDivider } from "@/src/ui/auth/signup-form-divider";
import { SocialLoginButton } from "@/src/ui/auth/social-login-button";

/**
 * Social and demo user signup section.
 */
export const SignupFormSocialSection: FC = () => (
	<div>
		<SignupFormDivider />
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
);
