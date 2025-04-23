import { Suspense } from "react";
import LoginFormV2 from "@/src/ui/login-form-v2";
import ClientComponent from "@/src/ui/client-component";

export default function LoginPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading ...</div>}>
        <LoginFormV2 />
      </Suspense>
      <ClientComponent />
    </main>
  );
}
