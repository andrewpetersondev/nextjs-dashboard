import type { JSX } from "react";
import { demoUserActionAdapter } from "@/modules/auth/server/actions/demo-user.action";
import { signupAction } from "@/modules/auth/server/actions/signup.action";
import { AUTH_DIVIDER_LABEL } from "@/modules/auth/shared/ui/auth.tokens";
import { SignupForm } from "@/modules/auth/ui/components/forms/signup-form";
import { AuthFormDemoSection } from "@/modules/auth/ui/components/shared/auth-form-demo-section";
import { AuthFormSocialSection } from "@/modules/auth/ui/components/shared/auth-form-social-section";
import { DividerAtom } from "@/ui/atoms/divider.atom";

export function SignupCard(): JSX.Element {
  return (
    <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
      <SignupForm action={signupAction} />
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
