import type React from "react";

const TOAST_DURATION_MS = 3000;

export async function SignupToast(): Promise<React.ReactElement> {
  // simulate async work (e.g., waiting for a network response or animation)
  await new Promise((resolve) => setTimeout(resolve, TOAST_DURATION_MS));

  return (
    <div
      aria-live="polite"
      role="alert"
      style={{
        background: "#111",
        borderRadius: 6,
        color: "#fff",
        padding: 12,
      }}
    >
      Signup successful — welcome!
    </div>
  );
}
