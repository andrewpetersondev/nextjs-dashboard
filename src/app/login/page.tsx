import { type JSX, Suspense } from "react";
import { LoginForm } from "@/src/ui/auth/login-form.tsx";

// biome-ignore lint/style/noDefaultExport: page and layout probably need to be default exports
export default function LoginPage(): JSX.Element {
	return (
		<main className="h-full">
			<Suspense fallback={<div>Loading ...</div>}>
				<LoginForm />
			</Suspense>
		</main>
	);
}
