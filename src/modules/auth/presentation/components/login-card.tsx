import type { JSX } from "react";
import { demoUserAction } from "@/modules/auth/presentation/authn/actions/demo-user.action";
import type { AuthActionProps } from "@/modules/auth/presentation/authn/transports/auth-action-props.transport";
import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import { LoginForm } from "@/modules/auth/presentation/components/forms/login-form";
import { AuthFormDemoSection } from "@/modules/auth/presentation/components/shared/auth-form-demo-section";
import { AuthFormSocialSection } from "@/modules/auth/presentation/components/shared/auth-form-social-section";
import { AUTH_DIVIDER_LABEL } from "@/modules/auth/presentation/constants/auth.tokens";
import { DividerAtom } from "@/ui/atoms/divider.atom";

export function LoginCard({
  action,
}: AuthActionProps<LoginField>): JSX.Element {
  return (
    <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
      <LoginForm action={action} />
      <DividerAtom label={AUTH_DIVIDER_LABEL} />
      <AuthFormDemoSection
        demoAdminText="Login as Demo Admin"
        demoUserAction={demoUserAction}
        demoUserText="Login as Demo User"
      />
      <AuthFormSocialSection mode="login" />
    </div>
  );
}
