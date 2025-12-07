import type { JSX } from "react";
import {
  AUTH_DIVIDER_LABEL,
  LOGIN_HEADING,
} from "@/modules/auth/domain/auth.constants";
import { demoUserActionAdapter } from "@/modules/auth/server/application/actions/demo-user.action";
import { loginAction } from "@/modules/auth/server/application/actions/login.action";
import { AuthFormDivider } from "@/modules/auth/ui/components/auth-form-divider";
import { AuthFormSocialSection } from "@/modules/auth/ui/components/auth-form-social-section";
import { AuthSwitchLink } from "@/modules/auth/ui/components/auth-switch-link";
import { Heading } from "@/modules/auth/ui/components/heading";
import { LoginForm } from "@/modules/auth/ui/components/login-form";
import { ROUTES } from "@/shared/routes/routes";

export default function Page(): JSX.Element {
  return (
    <main className="h-full">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Heading text={LOGIN_HEADING} />
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
            <LoginForm action={loginAction} />
            <AuthFormDivider label={AUTH_DIVIDER_LABEL} />
            <AuthFormSocialSection
              demoAdminText="Login as Demo Admin"
              demoUserAction={demoUserActionAdapter}
              demoUserText="Login as Demo User"
              mode="login"
            />
          </div>
          <AuthSwitchLink
            href={ROUTES.auth.signup}
            linkText="Sign up here"
            prompt="Not a member?"
          />
        </div>
      </div>
    </main>
  );
}
