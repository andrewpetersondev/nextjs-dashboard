import type { JSX } from "react";
import { ForgotPasswordLink } from "@/features/auth/components/forgot-password-link";
import { RememberMeCheckbox } from "@/features/auth/components/remember-me-checkbox";

export function AuthActionsRow(): JSX.Element {
  return (
    <div
      className="flex items-center justify-between"
      data-cy="auth-actions-row"
    >
      <RememberMeCheckbox />
      <ForgotPasswordLink />
    </div>
  );
}
