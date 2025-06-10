import { SignupForm } from "@/src/ui/auth/signup-form";
import type { JSX } from "react";

export default function SignupPage(): JSX.Element {
	return (
		<main className="h-full">
			<SignupForm />
		</main>
	);
}
