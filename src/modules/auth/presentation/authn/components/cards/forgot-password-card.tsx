import type { JSX } from "react";
import { ForgotPasswordForm } from "@/modules/auth/presentation/authn/components/forms/forgot-password-form";
import type { ForgotPasswordActionProps } from "@/modules/auth/presentation/authn/transports/auth-action-props.transport";

/**
 * Panel wrapper for the forgot-password form.
 *
 * Carries the same surface styling as the login and signup cards so the three
 * auth pages sit on an identical panel; change one and change all three.
 */
export function ForgotPasswordCard({
	action,
}: ForgotPasswordActionProps): JSX.Element {
	return (
		<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
			<ForgotPasswordForm action={action} />
		</div>
	);
}
