import type { JSX } from "react";
import { ClientLoginSection } from "@/src/ui/auth/client-login-section";
import { Heading } from "@/src/ui/auth/heading";

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
				{/* All client-only UI is rendered in a single Client Component */}
				<ClientLoginSection />
			</div>
		</main>
	);
}
