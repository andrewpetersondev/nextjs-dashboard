import Link from "next/link";
import type { JSX } from "react";

/**
 * ForgotPasswordLink component for navigating to the forgot password page.
 *
 * @returns {JSX.Element} Rendered ForgotPasswordLink component.
 */
export function ForgotPasswordLink(): JSX.Element {
  return (
    <div className="text-sm/6">
      <Link
        className="font-semibold text-text-secondary hover:text-text-hover"
        href="/forgot-password"
      >
        Forgot password?
      </Link>
    </div>
  );
}
