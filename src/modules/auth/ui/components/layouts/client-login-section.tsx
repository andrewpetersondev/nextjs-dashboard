import type { FC } from "react";
import { loginAction } from "@/modules/auth/server/application/actions/login.action";
import { LoginForm } from "@/modules/auth/ui/components/forms/login-form";
import { AuthFormDivider } from "@/modules/auth/ui/components/shared/auth-form-divider";
import { AuthSwitchLink } from "@/modules/auth/ui/components/shared/auth-switch-link";
import { AuthFormSocialSection } from "@/modules/auth/ui/components/social/auth-form-social-section";

/**
 * Presentational wrapper for client components on the login page.
 * Renders the login form, social login, and switch link.
 */
export const ClientLoginSection: FC = () => (
  <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
    <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
      <LoginForm action={loginAction} />
      <AuthFormDivider label="or continue with" />
      <AuthFormSocialSection
        demoAdminText="Login as Demo Admin"
        demoUserAction={async (prev, formData) => {
          "use server";
          const { demoUserActionAdapter } = await import(
            "@/modules/auth/server/application/actions/demo-user.action"
          );
          return demoUserActionAdapter(prev, formData);
        }}
        demoUserText="Login as Demo User"
        mode="login"
      />
    </div>
    {/* Switch the link below the card, matching the signup page */}
    <AuthSwitchLink
      href="/auth/signup"
      linkText="Sign up here"
      prompt="Not a member?"
    />
  </div>
);
