import LoginForm from "@/src/ui/auth/login-form";
import { type JSX, Suspense } from "react";

export default function LoginPage(): JSX.Element {
	return (
		<main className="h-full">
			<Suspense fallback={<div>Loading ...</div>}>
				<LoginForm />
			</Suspense>
		</main>
	);
}
