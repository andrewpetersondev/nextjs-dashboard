import Link from "next/link";
import type { JSX } from "react";

export function ForgotPasswordLink(): JSX.Element {
	return (
		<div className="text-sm/6">
			<Link
				href="/forgot-password"
				className="text-text-secondary hover:text-text-hover font-semibold"
			>
				Forgot password?
			</Link>
		</div>
	);
}
