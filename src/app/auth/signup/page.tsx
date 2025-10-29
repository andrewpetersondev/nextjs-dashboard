import type { JSX } from "react";
import { AuthFormDivider } from "@/features/auth/components/auth-form-divider";
import { AuthFormSocialSection } from "@/features/auth/components/auth-form-social-section";
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link";
import { Heading } from "@/features/auth/components/heading";
import { SignupForm } from "@/features/auth/components/signup-form";
import {
  AUTH_DIVIDER_LABEL,
  SIGNUP_HEADING,
} from "@/features/auth/lib/auth.constants";
import { demoUserActionAdapter } from "@/server/auth/application/actions/demo-user.action";
import { signupAction } from "@/server/auth/application/actions/signup.action";
import { ROUTES } from "@/shared/routes/routes";

export default function Page(): JSX.Element {
  return (
    <main className="h-full">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Heading text={SIGNUP_HEADING} />
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
            <SignupForm action={signupAction} />
            <AuthFormDivider label={AUTH_DIVIDER_LABEL} />
            <AuthFormSocialSection
              demoAdminText="Sign Up as Demo Admin"
              demoUserAction={demoUserActionAdapter}
              demoUserText="Sign Up as Demo User"
              mode="signup"
            />
          </div>
          <AuthSwitchLink
            href={ROUTES.AUTH.login}
            linkText="Log in here"
            prompt="Already a member?"
          />
        </div>
      </div>
    </main>
  );
}
