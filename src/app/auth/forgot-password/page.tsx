import type { JSX } from "react";
import { requestPasswordResetAction } from "@/modules/auth/presentation/authn/actions/request-password-reset.action";
import { ForgotPasswordCard } from "@/modules/auth/presentation/authn/components/cards/forgot-password-card";
import { AuthPageTemplate } from "@/modules/auth/presentation/authn/components/shared/wrappers/auth-page-template";
import { FORGOT_PASSWORD_HEADING } from "@/modules/auth/presentation/constants/auth.tokens";
import { ROUTES } from "@/shared/routing/routes";
import { LinkPromptMolecule } from "@/ui/molecules/link-prompt.molecule";

export default function ForgotPasswordPage(): JSX.Element {
	return (
		<AuthPageTemplate title={FORGOT_PASSWORD_HEADING}>
			<ForgotPasswordCard action={requestPasswordResetAction} />
			<LinkPromptMolecule
				href={ROUTES.auth.login}
				linkText="Log in here"
				prompt="Remembered your password?"
			/>
		</AuthPageTemplate>
	);
}
