import Link from "next/link";
import type { JSX } from "react";
import { cn } from "@/ui/utils/cn";

type LinkPromptProps = {
  /** The text prompt before the link (e.g. "Not a member?") */
  prompt: string;
  /** The URL the link points to */
  href: string;
  /** The text for the clickable link (e.g. "Sign up here") */
  linkText: string;
  /** Optional additional classes */
  className?: string;
};

/**
 * LinkPrompt
 * Displays a prompt message followed by a highlighted link.
 * Commonly used for switching between Login/Signup forms.
 */
export function LinkPrompt({
  prompt,
  href,
  linkText,
  className,
}: LinkPromptProps): JSX.Element {
  return (
    <p
      className={cn("mt-10 text-center text-sm/6 text-text-accent", className)}
    >
      {prompt}{" "}
      <Link
        className="font-semibold text-text-secondary underline decoration-text-accent underline-offset-8 hover:text-text-hover"
        href={href}
      >
        {linkText}
      </Link>
    </p>
  );
}
