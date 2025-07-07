import { type JSX, Suspense } from "react";
import { Heading } from "@/src/ui/auth/heading";
import { LoginForm } from "@/src/ui/auth/login-form";

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
				<Suspense fallback={<div>Loading ...</div>}>
					<LoginForm />
					{/*	LoginForm has */}
					{/*	div has sub-div and AuthSwitchLink */}
					{/*	sub-div has form, AuthServerMessage and LoginFormSocialSections*/}
				</Suspense>
			</div>
		</main>
	);
}
