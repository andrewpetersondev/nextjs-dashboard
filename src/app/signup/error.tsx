"use client";

import { type JSX, useEffect } from "react";
import { H2 } from "@/src/ui/headings";

/**
 * Error boundary for the signup page.
 *
 * @param error - The error object thrown by the route.
 * @param reset - Function to reset the error boundary.
 * @returns {JSX.Element} The rendered error UI.
 */
export default function SignupError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}): JSX.Element {
	useEffect((): void => {
		console.error(error);
	}, [error]);

	return (
		<main className="flex h-full flex-col items-center justify-center">
			<H2 className="text-center">Something went wrong!</H2>
			<button
				className="mt-4 rounded-md bg-bg-accent px-4 py-2 text-sm text-text-accent transition-colors hover:bg-bg-hover hover:text-text-hover"
				onClick={(): void => reset()}
				type="button"
			>
				Try again
			</button>
		</main>
	);
}
