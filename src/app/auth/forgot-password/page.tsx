import type { JSX } from "react";
import { AuthPageWrapper } from "@/modules/auth/presentation/authn/components/shared/layout/auth-page-wrapper";

export default function ForgotPasswordPage(): JSX.Element {
  return (
    <AuthPageWrapper title="Forgot your password?">
      <div className="flex flex-col items-center justify-center">
        <h2>Forgot Password Page</h2>
      </div>
    </AuthPageWrapper>
  );
}
