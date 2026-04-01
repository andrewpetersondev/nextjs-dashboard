import type { JSX } from "react";
import { AuthPageTemplate } from "@/modules/auth/presentation/authn/components/shared/wrappers/auth-page-template";

export default function ForgotPasswordPage(): JSX.Element {
	return (
		<AuthPageTemplate title="Forgot your password?">
			<div className="flex flex-col items-center justify-center">
				<h2>Forgot Password Page</h2>
			</div>
		</AuthPageTemplate>
	);
}
