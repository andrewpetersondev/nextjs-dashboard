import type { JSX } from "react";
import {
  demoAdminAction,
  demoUserAction,
} from "@/modules/auth/presentation/authn/actions/demo-user.action";
import { SignupForm } from "@/modules/auth/presentation/authn/components/forms/signup-form";
import { AuthFormDemoSection } from "@/modules/auth/presentation/authn/components/shared/sections/auth-form-demo-section";
import { AuthFormSocialSection } from "@/modules/auth/presentation/authn/components/shared/sections/auth-form-social-section";
import type { AuthActionProps } from "@/modules/auth/presentation/authn/transports/auth-action-props.transport";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
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
        demoAdminAction={demoAdminAction}
        demoAdminText="Sign Up as Demo Admin"
        demoUserAction={demoUserAction}
        demoUserText="Sign Up as Demo User"
      />
      <AuthFormSocialSection mode="signup" />
    </div>
  );
}
