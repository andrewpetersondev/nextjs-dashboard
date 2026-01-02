import type { JSX } from "react";
import type {
  AuthActionProps,
  SignupField,
} from "@/modules/auth/application/dtos/auth-ui.dto";
import { demoUserActionAdapter } from "@/modules/auth/infrastructure/actions/demo-user.action";
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
        demoUserAction={demoUserActionAdapter}
        demoUserText="Sign Up as Demo User"
      />
      <AuthFormSocialSection mode="signup" />
    </div>
  );
}
