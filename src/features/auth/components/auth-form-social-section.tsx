import type { FC } from "react";
import { DemoForm } from "@/features/auth/components/demo-form";
import { SocialLoginButton } from "@/features/auth/components/social-login-button";

import type { AuthRole } from "@/shared/auth/types";

/**
 * Props for AuthFormSocialSection.
 */
interface AuthFormSocialSectionProps {
  /** Text for the demo user button */
  demoUserText: string;
  /** Text for the demo admin button */
  demoAdminText: string;
  /** Mode for social login ("login" or "signup") */
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
      label="demo-user"
      text={demoUserText}
      userRole={"user" as AuthRole}
    />
    <DemoForm
      label="demo-admin-user"
      text={demoAdminText}
      userRole={"admin" as AuthRole}
    />

    {/* Social login buttons */}
    <div className="mt-6 grid grid-cols-2 gap-4">
      <SocialLoginButton
        data-cy={`${mode}-google`}
        href="/api/auth/google"
        mode={mode}
        provider="Google"
      />
      <SocialLoginButton
        data-cy={`${mode}-github`}
        href="/api/auth/github"
        mode={mode}
        provider="GitHub"
      />
    </div>
  </>
);
