import type { JSX } from "react";
import { SignupForm } from "@/src/ui/auth/signup-form.tsx";

// biome-ignore lint/style/noDefaultExport: page and layout probably need to be default exports
export default function SignupPage(): JSX.Element {
	return (
		<main className="h-full">
			<SignupForm />
		</main>
	);
}
