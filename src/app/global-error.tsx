"use client";

// biome-ignore lint/nursery/useExplicitType: <default>
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags
    <html lang="en-US">
      <body>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        {/** biome-ignore lint/a11y/useButtonType: <default> */}
        <button onClick={(): void => reset()}>Try again</button>
      </body>
    </html>
  );
}
