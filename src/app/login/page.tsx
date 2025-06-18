import { type JSX, Suspense } from "react";
import LoginForm from "@/src/ui/auth/login-form";

export default function LoginPage(): JSX.Element {
	return (
		<main className="h-full">
			<Suspense fallback={<div>Loading ...</div>}>
				<LoginForm />
			</Suspense>
		</main>
	);
}
