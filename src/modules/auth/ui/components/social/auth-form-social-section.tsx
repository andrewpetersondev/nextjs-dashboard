import type { FC, JSX } from "react";
import {
  AUTH_ENDPOINTS,
  DEMO_ADMIN_LABEL,
  DEMO_USER_LABEL,
} from "@/modules/auth/domain/auth.constants";
import {
  ADMIN_ROLE,
  USER_ROLE,
  type UserRole,
} from "@/modules/auth/domain/roles/auth.roles";
import { DemoForm } from "@/modules/auth/ui/components/forms/demo-form";
import { SocialLoginButton } from "@/modules/auth/ui/components/social/social-login-button";
import type { FormResult } from "@/shared/forms/types/form-result.types";

interface AuthFormSocialSectionProps {
  readonly demoAdminText: string;
  readonly demoUserAction: (
    _prevState: FormResult<never>,
    formData: FormData,
  ) => Promise<FormResult<never>>;
  readonly demoUserText: string;
  readonly mode: "login" | "signup";
}

/**
 * AuthFormSocialSection
 * Reusable social section for authentication forms.
 * Displays demo user/admin login buttons and OAuth social login options.
 *
 * @param props - AuthFormSocialSectionProps
 * @returns Social login section component.
 */
export const AuthFormSocialSection: FC<AuthFormSocialSectionProps> = ({
  demoUserText,
  demoAdminText,
  demoUserAction,
  mode,
}: AuthFormSocialSectionProps): JSX.Element => (
  <>
    {/* Demo user and admin buttons */}
    <DemoForm
      action={demoUserAction}
      label={DEMO_USER_LABEL}
      text={demoUserText}
      userRole={USER_ROLE as UserRole}
    />
    <DemoForm
      action={demoUserAction}
      label={DEMO_ADMIN_LABEL}
      text={demoAdminText}
      userRole={ADMIN_ROLE as UserRole}
    />

    {/* Social login buttons */}
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
  </>
);
