import type { JSX } from "react";
import { signupAction } from "@/modules/auth/presentation/authn/actions/signup.action";
import { SignupCard } from "@/modules/auth/presentation/authn/components/cards/signup-card";
import { AuthPageTemplate } from "@/modules/auth/presentation/authn/components/shared/wrappers/auth-page-template";
import { SIGNUP_HEADING } from "@/modules/auth/presentation/constants/auth.tokens";
import { ROUTES } from "@/shared/routing/routes";
import { LinkPrompt } from "@/ui/molecules/link-prompt";

export default function SignupPage(): JSX.Element {
	return (
		<AuthPageTemplate title={SIGNUP_HEADING}>
			<SignupCard action={signupAction} />
			<LinkPrompt
				href={ROUTES.auth.login}
				linkText="Log in here"
				prompt="Already a member?"
			/>
		</AuthPageTemplate>
	);
}
