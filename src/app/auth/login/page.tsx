import type { JSX } from "react";
import {
  AUTH_DIVIDER_LABEL,
  LOGIN_HEADING,
} from "@/modules/auth/domain/auth.constants";
import { demoUserActionAdapter } from "@/modules/auth/server/application/actions/demo-user.action";
import { loginAction } from "@/modules/auth/server/application/actions/login.action";
import { LoginForm } from "@/modules/auth/ui/components/forms/login-form";
import { AuthFormSocialSection } from "@/modules/auth/ui/components/social/auth-form-social-section";
import { ROUTES } from "@/shared/routes/routes";
import { Divider } from "@/ui/atoms/divider";
import { LinkPrompt } from "@/ui/molecules/link-prompt";
import { PageHeader } from "@/ui/molecules/page-header";

function LoginCard(): JSX.Element {
  return (
    <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
      <LoginForm action={loginAction} />
      <Divider label={AUTH_DIVIDER_LABEL} />
      <AuthFormSocialSection
        demoAdminText="Login as Demo Admin"
        demoUserAction={demoUserActionAdapter}
        demoUserText="Login as Demo User"
        mode="login"
      />
    </div>
  );
}

export default function LoginPage(): JSX.Element {
  return (
    <main className="h-full">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <PageHeader
          logoSrc="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          title={LOGIN_HEADING}
        />
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <LoginCard />
          <LinkPrompt
            href={ROUTES.auth.signup}
            linkText="Sign up here"
            prompt="Not a member?"
          />
        </div>
      </div>
    </main>
  );
}
