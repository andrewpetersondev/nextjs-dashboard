import type { JSX } from "react";
import { SignupForm } from "@/src/ui/auth/signup-form";

/**
 * Renders the signup page.
 *
 * @returns The signup page.
 */
export default function Page(): JSX.Element {
	return (
		<main className="h-full">
			<SignupForm />
		</main>
	);
}
