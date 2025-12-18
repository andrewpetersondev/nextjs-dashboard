import type { JSX } from "react";
import { demoUserActionAdapter } from "@/modules/auth/server/actions/demo-user.action";
import type { LoginField } from "@/modules/auth/shared/domain/user/auth.schema";
import { AUTH_DIVIDER_LABEL } from "@/modules/auth/shared/ui/auth.tokens";
import { LoginForm } from "@/modules/auth/ui/components/forms/login-form";
import { AuthFormDemoSection } from "@/modules/auth/ui/components/shared/auth-form-demo-section";
import { AuthFormSocialSection } from "@/modules/auth/ui/components/shared/auth-form-social-section";
import type { FormAction } from "@/shared/forms/types/form-action.dto";
import { DividerAtom } from "@/ui/atoms/divider.atom";

interface LoginCardProps {
  action: FormAction<LoginField>;
}

export function LoginCard({ action }: LoginCardProps): JSX.Element {
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
