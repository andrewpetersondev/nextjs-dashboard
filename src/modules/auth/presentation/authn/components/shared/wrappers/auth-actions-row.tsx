import type { JSX } from "react";
import { ForgotPasswordLink } from "@/modules/auth/presentation/authn/components/shared/forgot-password-link";
import { RememberMeCheckbox } from "@/modules/auth/presentation/authn/components/shared/remember-me-checkbox";

/**
 * The "remember me" / "forgot password" line beneath the credentials fields.
 *
 * Takes no props: both children are fixed, so the row has nothing to configure.
 * `data-cy` is load-bearing for the e2e suite.
 */
export function AuthActionsRow(): JSX.Element {
	return (
		<div className="flex items-center justify-between" data-cy="auth-actions">
			<RememberMeCheckbox />
			<ForgotPasswordLink />
		</div>
	);
}
