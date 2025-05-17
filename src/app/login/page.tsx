import { Suspense } from "react";
import LoginForm from "@/src/ui/auth/login-form";

export default function LoginPage() {
	return (
		<main className="h-full">
			<Suspense fallback={<div>Loading ...</div>}>
				<LoginForm />
			</Suspense>
		</main>
	);
}
