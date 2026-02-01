import type { JSX } from "react";
import { RememberMeCheckbox } from "@/modules/auth/presentation/authn/components/shared/controls/remember-me-checkbox";
import { ForgotPasswordLink } from "@/modules/auth/presentation/authn/components/shared/links/forgot-password-link";

export function AuthActionsRow(): JSX.Element {
  return (
    <div className="flex items-center justify-between" data-cy="auth-actions">
      <RememberMeCheckbox />
      <ForgotPasswordLink />
    </div>
  );
}
