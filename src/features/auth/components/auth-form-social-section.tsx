import type { FC } from "react";
import { DemoForm } from "@/features/auth/components/demo-form";
import { SocialLoginButton } from "@/features/auth/components/social-login-button";
import {
  AUTH_GITHUB_ENDPOINT,
  AUTH_GOOGLE_ENDPOINT,
  DEMO_ADMIN_LABEL,
  DEMO_USER_LABEL,
} from "@/features/auth/lib/auth.constants";
import {
  ADMIN_ROLE,
  USER_ROLE,
  type UserRole,
} from "@/features/auth/lib/auth.roles";

interface AuthFormSocialSectionProps {
  demoUserText: string;
  demoAdminText: string;
  mode: "login" | "signup";
}

/**
 * AuthFormSocialSection
 * Reusable social section for authentication forms.
 *
 * @param props - AuthFormSocialSectionProps
 * @returns Social login section component.
 */
export const AuthFormSocialSection: FC<AuthFormSocialSectionProps> = ({
  demoUserText,
  demoAdminText,
  mode,
}: AuthFormSocialSectionProps) => (
  <>
    {/* Demo user and admin buttons */}
    <DemoForm
      label={DEMO_USER_LABEL}
      text={demoUserText}
      userRole={USER_ROLE as UserRole}
    />
    <DemoForm
      label={DEMO_ADMIN_LABEL}
      text={demoAdminText}
      userRole={ADMIN_ROLE as UserRole}
    />

    {/* Social login buttons */}
    <div className="mt-6 grid grid-cols-2 gap-4">
      <SocialLoginButton
        data-cy="auth-social-google-button"
        href={AUTH_GOOGLE_ENDPOINT}
        mode={mode}
        provider="Google"
      />
      <SocialLoginButton
        data-cy="auth-social-github-button"
        href={AUTH_GITHUB_ENDPOINT}
        mode={mode}
        provider="GitHub"
      />
    </div>
  </>
);
