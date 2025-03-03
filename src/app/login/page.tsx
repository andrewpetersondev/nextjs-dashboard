import AcmeLogo from "@/ui/acme-logo";
import LoginForm from "@/ui/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  const x = 5;
  const y = 10;
  console.log("Login Page , ",x + y);

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
