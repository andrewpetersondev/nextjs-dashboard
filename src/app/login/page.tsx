import LoginForm from "@/src/ui/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
	return (
		<main className="h-full">
			<Suspense fallback={<div>Loading ...</div>}>
				<LoginForm />
			</Suspense>
		</main>
	);
}
