import type { JSX, ReactNode } from "react";

export function FormInputWrapper({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="mb-4">
      <div className="rounded-md p-4">{children}</div>
    </div>
  );
}
