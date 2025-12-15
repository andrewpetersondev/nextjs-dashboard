import type { FC, JSX } from "react";
import { AUTH_ENDPOINTS } from "@/modules/auth/shared/ui/auth-ui.constants";
import { SocialLoginButton } from "@/modules/auth/ui/components/shared/social-login-button";

interface AuthFormSocialSectionProps {
  readonly mode: "login" | "signup";
}

/**
 * AuthFormSocialSection
 * Reusable social section for authentication forms.
 * Displays OAuth social login options.
 */
export const AuthFormSocialSection: FC<AuthFormSocialSectionProps> = ({
  mode,
}: AuthFormSocialSectionProps): JSX.Element => (
  <div className="mt-6 grid grid-cols-2 gap-4">
    <SocialLoginButton
      data-cy="auth-social-google-button"
      href={AUTH_ENDPOINTS.google}
      mode={mode}
      provider="google"
    />
    <SocialLoginButton
      data-cy="auth-social-github-button"
      href={AUTH_ENDPOINTS.github}
      mode={mode}
      provider="github"
    />
  </div>
);
