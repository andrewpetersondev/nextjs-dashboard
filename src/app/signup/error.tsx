"use client";

import { H2 } from "@/src/ui/headings";
import { type JSX, useEffect } from "react";

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
				type="button"
				className="mt-4 rounded-md bg-bg-accent px-4 py-2 text-sm text-text-accent transition-colors hover:bg-bg-hover hover:text-text-hover"
				onClick={(): void => reset()}
			>
				Try again
			</button>
		</main>
	);
}
