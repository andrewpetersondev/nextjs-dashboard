import type { JSX } from "react";
import { demoUserAction } from "@/modules/auth/presentation/authn/actions/demo-user.action";
import type { AuthActionProps } from "@/modules/auth/presentation/authn/transports/auth-action-props.transport";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import { SignupForm } from "@/modules/auth/presentation/components/forms/signup-form";
import { AuthFormDemoSection } from "@/modules/auth/presentation/components/shared/auth-form-demo-section";
import { AuthFormSocialSection } from "@/modules/auth/presentation/components/shared/auth-form-social-section";
import { AUTH_DIVIDER_LABEL } from "@/modules/auth/presentation/constants/auth.tokens";
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
        demoUserAction={demoUserAction}
        demoUserText="Sign Up as Demo User"
      />
      <AuthFormSocialSection mode="signup" />
    </div>
  );
}
