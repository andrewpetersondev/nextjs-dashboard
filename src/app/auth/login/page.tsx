import type { JSX } from "react";
import { AuthFormDivider } from "@/features/auth/components/auth-form-divider";
import { AuthFormSocialSection } from "@/features/auth/components/auth-form-social-section";
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link";
import { Heading } from "@/features/auth/components/heading";
import { LoginForm } from "@/features/auth/components/login-form";
import { AUTH_DIVIDER_LABEL, LOGIN_HEADING } from "@/features/auth/constants";
import { login } from "@/server/auth/actions/login";
import { ROUTES } from "@/shared/routes/routes";

export default function Page(): JSX.Element {
  return (
    <main className="h-full">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Heading text={LOGIN_HEADING} />
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
            <LoginForm action={login} />
            <AuthFormDivider label={AUTH_DIVIDER_LABEL} />
            <AuthFormSocialSection
              demoAdminText="Login as Demo Admin"
              demoUserText="Login as Demo User"
              mode="login"
            />
          </div>
          {/* Switch the link below the card, matching the signup page */}
          <AuthSwitchLink
            href={ROUTES.AUTH.SIGNUP}
            linkText="Sign up here"
            prompt="Not a member?"
          />
        </div>
      </div>
    </main>
  );
}
