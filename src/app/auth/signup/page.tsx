import type { JSX } from "react";
import { SIGNUP_HEADING } from "@/modules/auth/ui/auth.tokens";
import { AuthPageWrapper } from "@/modules/auth/ui/components/shared/auth-page-wrapper";
import { SignupCard } from "@/modules/auth/ui/components/signup-card";
import { ROUTES } from "@/shared/routes/routes";
import { LinkPrompt } from "@/ui/molecules/link-prompt";

export default function SignupPage(): JSX.Element {
  return (
    <AuthPageWrapper title={SIGNUP_HEADING}>
      <SignupCard />
      <LinkPrompt
        href={ROUTES.auth.login}
        linkText="Log in here"
        prompt="Already a member?"
      />
    </AuthPageWrapper>
  );
}
