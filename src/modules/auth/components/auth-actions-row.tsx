import type { JSX } from "react";
import { ForgotPasswordLink } from "@/modules/auth/components/forgot-password-link";
import { RememberMeCheckbox } from "@/modules/auth/components/remember-me-checkbox";

export function AuthActionsRow(): JSX.Element {
  return (
    <div className="flex items-center justify-between" data-cy="auth-actions">
      <RememberMeCheckbox />
      <ForgotPasswordLink />
    </div>
  );
}
