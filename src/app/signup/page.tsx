import type { JSX } from "react";
import { ClientSignupSection } from "@/src/ui/auth/client-signup-section";
import { Heading } from "@/src/ui/auth/heading";

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
				{/* All client-only UIs are rendered in a single Client Component */}
				{/* The SignupForm is a client component that handles the signup logic */}
				<ClientSignupSection />
			</div>
		</main>
	);
}
