import type { JSX } from "react";
import { loginAction } from "@/modules/auth/infrastructure/actions/login.action";
import { LoginCard } from "@/modules/auth/presentation/components/login-card";
import { AuthPageWrapper } from "@/modules/auth/presentation/components/shared/auth-page-wrapper";
import { LOGIN_HEADING } from "@/modules/auth/presentation/constants/auth.tokens";
import { ROUTES } from "@/shared/routes/routes";
import { LinkPrompt } from "@/ui/molecules/link-prompt";

export default function LoginPage(): JSX.Element {
  return (
    <AuthPageWrapper title={LOGIN_HEADING}>
      <LoginCard action={loginAction} />
      <LinkPrompt
        href={ROUTES.auth.signup}
        linkText="Sign up here"
        prompt="Not a member?"
      />
    </AuthPageWrapper>
  );
}
