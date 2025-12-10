import type { JSX } from "react";
import { AuthPageWrapper } from "@/modules/auth/ui/components/shared/auth-page-wrapper";

export default function ForgotPasswordPage(): JSX.Element {
  return (
    <AuthPageWrapper title="Forgot your password?">
      <div className="flex flex-col items-center justify-center">
        <h2>Forgot Password Page</h2>
      </div>
    </AuthPageWrapper>
  );
}
