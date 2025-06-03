import { FaceFrownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function NotFound() {
	return (
		<main className="flex h-full flex-col items-center justify-center gap-2">
			<FaceFrownIcon className="w-10 text-text-disabled" />
			<h2 className="text-xl font-semibold">404 Not Found</h2>
			<p>Could not find the requested user profile.</p>
			<Link
				href="/dashboard/users"
				className="mt-4 rounded-md bg-bg-accent px-4 py-2 text-sm text-text-accent transition-colors hover:bg-bg-hover hover:text-text-hover"
			>
				Go Back
			</Link>
		</main>
	);
}
