import type { JSX } from "react";
import { Heading } from "@/src/ui/auth/heading.tsx";
import { SignupForm } from "@/src/ui/auth/signup-form";

/**
 * Signup page component.
 * Renders the signup form.
 * @returns The signup page.
 */
export default function Page(): JSX.Element {
	return (
		<main className="h-full">
			<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
				<Heading text="Sign up for an account" />
				<SignupForm />
			</div>
		</main>
	);
}
