import Link from "next/link";
import type { JSX } from "react";

export function ForgotPasswordLink(): JSX.Element {
	return (
		<div className="text-sm/6">
			<Link
				className="text-text-secondary hover:text-text-hover font-semibold"
				href="/forgot-password"
			>
				Forgot password?
			</Link>
		</div>
	);
}
