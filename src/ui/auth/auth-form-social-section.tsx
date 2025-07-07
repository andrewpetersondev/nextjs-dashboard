import type { FC } from "react";
import { DemoAdminUser } from "@/src/ui/auth/demo-admin-user";
import { DemoUser } from "@/src/ui/auth/demo-user";
import { SocialLoginButton } from "@/src/ui/auth/social-login-button";

/**
 * Props for AuthFormSocialSection.
 */
export interface AuthFormSocialSectionProps {
	/** Text for the demo user button */
	demoUserText: string;
	/** Text for the demo admin button */
	demoAdminText: string;
	/** Mode for social login ("login" or "signup") */
	mode: "login" | "signup";
}

/**
 * AuthFormSocialSection
 * Reusable social section for authentication forms.
 *
 * @param props - AuthFormSocialSectionProps
 * @returns Social login section component.
 */
export const AuthFormSocialSection: FC<AuthFormSocialSectionProps> = ({
	demoUserText,
	demoAdminText,
	mode,
}) => (
	<>
		{/* Demo user and admin buttons */}
		<DemoUser text={demoUserText} />
		<DemoAdminUser text={demoAdminText} />
		{/* Social login buttons */}
		<div className="mt-6 grid grid-cols-2 gap-4">
			<SocialLoginButton
				data-cy={`${mode}-google`}
				href="/api/auth/google"
				mode={mode}
				provider="Google"
			/>
			<SocialLoginButton
				data-cy={`${mode}-github`}
				href="/api/auth/github"
				mode={mode}
				provider="GitHub"
			/>
		</div>
	</>
);
