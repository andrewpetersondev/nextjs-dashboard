import type { JSX } from "react";
import { AUTH_DIVIDER_LABEL } from "@/modules/auth/domain/auth.constants";
import { demoUserActionAdapter } from "@/modules/auth/server/application/actions/demo-user.action";
import { signupAction } from "@/modules/auth/server/application/actions/signup.action";
import { SignupForm } from "@/modules/auth/ui/components/forms/signup-form";
import { AuthFormSocialSection } from "@/modules/auth/ui/components/social/auth-form-social-section";
import { Divider } from "@/ui/atoms/divider";

export function SignupCard(): JSX.Element {
  return (
    <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
      <SignupForm action={signupAction} />
      <Divider label={AUTH_DIVIDER_LABEL} />
      <AuthFormSocialSection
        demoAdminText="Sign Up as Demo Admin"
        demoUserAction={demoUserActionAdapter}
        demoUserText="Sign Up as Demo User"
        mode="signup"
      />
    </div>
  );
}
