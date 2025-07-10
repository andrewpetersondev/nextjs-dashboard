import type { JSX } from "react";
import { ClientLoginSection } from "@/ui/auth/client-login-section";
import { Heading } from "@/ui/auth/heading";

/**
 * Renders the login page.
 *
 * @returns {JSX.Element} The login page.
 */
export default function Page(): JSX.Element {
	return (
		<main className="h-full">
			<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
				<Heading text="Log in to your account" />
				{/* All client-only UIs are rendered in a single Client Component */}
				{/* The ClientForm is a client component that handles the login logic*/}
				<ClientLoginSection />
			</div>
		</main>
	);
}
