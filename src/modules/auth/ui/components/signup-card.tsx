import type { JSX } from "react";
import { demoUserActionAdapter } from "@/modules/auth/server/actions/demo-user.action";
import type { SignupField } from "@/modules/auth/shared/domain/user/auth-user.schema";
import { AUTH_DIVIDER_LABEL } from "@/modules/auth/ui/auth.tokens";
import type { AuthActionProps } from "@/modules/auth/ui/components/auth-ui.dto";
import { SignupForm } from "@/modules/auth/ui/components/forms/signup-form";
import { AuthFormDemoSection } from "@/modules/auth/ui/components/shared/auth-form-demo-section";
import { AuthFormSocialSection } from "@/modules/auth/ui/components/shared/auth-form-social-section";
import { DividerAtom } from "@/ui/atoms/divider.atom";

export function SignupCard({
  action,
}: AuthActionProps<SignupField>): JSX.Element {
  return (
    <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
      <SignupForm action={action} />
      <DividerAtom label={AUTH_DIVIDER_LABEL} />
      <AuthFormDemoSection
        demoAdminText="Sign Up as Demo Admin"
        demoUserAction={demoUserActionAdapter}
        demoUserText="Sign Up as Demo User"
      />
      <AuthFormSocialSection mode="signup" />
    </div>
  );
}
