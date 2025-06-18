import type { JSX } from "react";
import { SignupForm } from "@/src/ui/auth/signup-form";

export default function SignupPage(): JSX.Element {
	return (
		<main className="h-full">
			<SignupForm />
		</main>
	);
}
