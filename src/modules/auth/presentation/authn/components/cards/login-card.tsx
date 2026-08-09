import type { JSX } from "react";
import {
	demoAdminAction,
	demoUserAction,
} from "@/modules/auth/presentation/authn/actions/demo-user.action";
import { LoginForm } from "@/modules/auth/presentation/authn/components/forms/login-form";
import { AuthFormDemoSection } from "@/modules/auth/presentation/authn/components/shared/sections/auth-form-demo-section";
import type { AuthActionProps } from "@/modules/auth/presentation/authn/transports/auth-action-props.transport";
import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import { AUTH_DIVIDER_LABEL } from "@/modules/auth/presentation/constants/auth.tokens";
import { DividerAtom } from "@/ui/atoms/divider.atom";

/**
 * The login panel: credentials form, divider, then the two demo shortcuts.
 *
 * The demo actions are imported here rather than passed in, because they are
 * fixed entry points rather than a caller's choice — only the real credentials
 * `action` varies.
 */
export function LoginCard({
	action,
}: AuthActionProps<LoginField>): JSX.Element {
	return (
		<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
			<LoginForm action={action} />
			<DividerAtom label={AUTH_DIVIDER_LABEL} />
			<AuthFormDemoSection
				demoAdminAction={demoAdminAction}
				demoAdminText="Login as Demo Admin"
				demoUserAction={demoUserAction}
				demoUserText="Login as Demo User"
			/>
		</div>
	);
}
