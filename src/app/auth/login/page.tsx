import type { JSX } from "react";
import { LOGIN_HEADING } from "@/modules/auth/shared/ui/auth.tokens";
import { LoginCard } from "@/modules/auth/ui/components/login-card";
import { AuthPageWrapper } from "@/modules/auth/ui/components/shared/auth-page-wrapper";
import { ROUTES } from "@/shared/routes/routes";
import { LinkPrompt } from "@/ui/molecules/link-prompt";

export default function LoginPage(): JSX.Element {
  return (
    <AuthPageWrapper title={LOGIN_HEADING}>
      <LoginCard />
      <LinkPrompt
        href={ROUTES.auth.signup}
        linkText="Sign up here"
        prompt="Not a member?"
      />
    </AuthPageWrapper>
  );
}
