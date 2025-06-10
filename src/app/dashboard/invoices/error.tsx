"use client";

import { useEffect } from "react";

export default function InvoicesError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="flex h-full flex-col items-center justify-center">
			<h2 className="text-center">Something went wrong!</h2>
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
