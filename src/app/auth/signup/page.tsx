import type { JSX } from "react";
import { SIGNUP_HEADING } from "@/modules/auth/domain/auth.constants";
import { SignupCard } from "@/modules/auth/ui/components/signup-card";
import { ROUTES } from "@/shared/routes/routes";
import { LinkPrompt } from "@/ui/molecules/link-prompt";
import { PageHeader } from "@/ui/molecules/page-header";

export default function SignupPage(): JSX.Element {
  return (
    <main className="h-full">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <PageHeader
          logoSrc="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          title={SIGNUP_HEADING}
        />
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <SignupCard />
          <LinkPrompt
            href={ROUTES.auth.login}
            linkText="Log in here"
            prompt="Already a member?"
          />
        </div>
      </div>
    </main>
  );
}
