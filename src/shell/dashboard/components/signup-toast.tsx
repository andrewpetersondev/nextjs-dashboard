import type React from "react";

export async function SignupToast(): Promise<React.ReactElement> {
  // simulate async work (e.g., waiting for a network response or animation)
  await new Promise((resolve) => setTimeout(resolve, 300));

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
