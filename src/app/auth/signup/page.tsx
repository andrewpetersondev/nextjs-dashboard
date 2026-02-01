import type { JSX } from "react";
import { signupAction } from "@/modules/auth/presentation/authn/actions/signup.action";
import { SignupCard } from "@/modules/auth/presentation/authn/components/cards/signup-card";
import { AuthPageWrapper } from "@/modules/auth/presentation/authn/components/shared/auth-page-wrapper";
import { SIGNUP_HEADING } from "@/modules/auth/presentation/constants/auth.tokens";
import { ROUTES } from "@/shared/routes/routes";
import { LinkPrompt } from "@/ui/molecules/link-prompt";

export default function SignupPage(): JSX.Element {
  return (
    <AuthPageWrapper title={SIGNUP_HEADING}>
      <SignupCard action={signupAction} />
      <LinkPrompt
        href={ROUTES.auth.login}
        linkText="Log in here"
        prompt="Already a member?"
      />
    </AuthPageWrapper>
  );
}
