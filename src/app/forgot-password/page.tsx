import type { JSX } from "react";
import { Heading } from "@/src/ui/auth/heading";

export default function Page(): JSX.Element {
	return (
		<div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
			<Heading text="Forgot your password?" />
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
				<h2>Forgot Password Page</h2>
			</div>
		</div>
	);
}
