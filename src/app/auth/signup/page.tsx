import type { JSX } from "react";
import { AuthFormDivider } from "@/features/auth/components/auth-form-divider";
import { AuthFormSocialSection } from "@/features/auth/components/auth-form-social-section";
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link";
import { Heading } from "@/features/auth/components/heading";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function Page(): JSX.Element {
  return (
    <main className="h-full">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Heading text="Log in to your account" />
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
            <SignupForm />
            <AuthFormDivider label="or continue with" />
            <AuthFormSocialSection
              demoAdminText="Sign Up as Demo Admin"
              demoUserText="Sign Up as Demo User"
              mode="login"
            />
          </div>
          <AuthSwitchLink
            href="/auth/login"
            linkText="Log in here"
            prompt="Already a member?"
          />
        </div>
      </div>
    </main>
  );
}
