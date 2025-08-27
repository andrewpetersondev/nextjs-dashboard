import { FaceFrownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { JSX } from "react";
import { H2 } from "@/ui/primitives/headings";

export default function NotFound(): JSX.Element {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-text-disabled" />
      <H2>404 Not Found</H2>
      <p>Could not find the requested user profile.</p>
      <Link
        className="mt-4 rounded-md bg-bg-accent px-4 py-2 text-sm text-text-accent transition-colors hover:bg-bg-hover hover:text-text-hover"
        href="/dashboard/users"
      >
        Go Back
      </Link>
    </main>
  );
}
