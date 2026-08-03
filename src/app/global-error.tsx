"use client";

// biome-ignore lint/nursery/useExplicitType: <fix later>
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		// global-error must include html and body tags; it replaces the root
		// layout entirely, so it declares its own lang (kept in sync with
		// layout.tsx) and its own main landmark.
		<html lang="en">
			<body>
				<main>
					<h2>Something went wrong!</h2>
					<h3 className="text-center">Global Error</h3>
					<p>{error.message}</p>
					<button onClick={reset} type="button">
						Try again
					</button>
				</main>
			</body>
		</html>
	);
}
