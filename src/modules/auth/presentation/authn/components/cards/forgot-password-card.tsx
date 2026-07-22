import type { JSX } from "react";
import { ForgotPasswordForm } from "@/modules/auth/presentation/authn/components/forms/forgot-password-form";
import type { ForgotPasswordActionProps } from "@/modules/auth/presentation/authn/transports/auth-action-props.transport";

export function ForgotPasswordCard({
	action,
}: ForgotPasswordActionProps): JSX.Element {
	return (
		<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
			<ForgotPasswordForm action={action} />
		</div>
	);
}
