import { type JSX, Suspense } from "react";
import { LoginForm } from "@/src/ui/auth/login-form";

/**
 * Renders the login page.
 *
 * @returns {JSX.Element} The login page.
 */
export default function Page(): JSX.Element {
	return (
		<main className="h-full">
			<Suspense fallback={<div>Loading ...</div>}>
				<LoginForm />
			</Suspense>
		</main>
	);
}
