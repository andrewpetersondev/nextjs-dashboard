import type { JSX } from "react";
import { AUTH_DIVIDER_LABEL } from "@/modules/auth/domain/auth.constants";
import { demoUserActionAdapter } from "@/modules/auth/server/application/actions/demo-user.action";
import { loginAction } from "@/modules/auth/server/application/actions/login.action";
import { AuthFormDemoSection } from "@/modules/auth/ui/components/forms/auth-form-demo-section";
import { LoginForm } from "@/modules/auth/ui/components/forms/login-form";
import { AuthFormSocialSection } from "@/modules/auth/ui/components/social/auth-form-social-section";
import { Divider } from "@/ui/atoms/divider";

export function LoginCard(): JSX.Element {
  return (
    <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
      <LoginForm action={loginAction} />
      <Divider label={AUTH_DIVIDER_LABEL} />
      <AuthFormDemoSection
        demoAdminText="Login as Demo Admin"
        demoUserAction={demoUserActionAdapter}
        demoUserText="Login as Demo User"
      />
      <AuthFormSocialSection mode="login" />
    </div>
  );
}
