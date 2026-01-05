import type { JSX } from "react";
import type { LoginField } from "@/modules/auth/application/dtos/auth-ui.dto";
import { demoUserActionAdapter } from "@/modules/auth/infrastructure/actions/demo-user.action";
import type { AuthActionProps } from "@/modules/auth/presentation/auth.transport";
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
        demoUserAction={demoUserActionAdapter}
        demoUserText="Login as Demo User"
      />
      <AuthFormSocialSection mode="login" />
    </div>
  );
}
