import { Suspense } from "react";
import LoginFormV2 from "@/src/ui/login-form-v2";

export default function LoginPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading ...</div>}>
        <LoginFormV2 />
      </Suspense>
    </main>
  );
}
