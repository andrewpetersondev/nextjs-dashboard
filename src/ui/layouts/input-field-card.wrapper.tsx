import type { JSX, ReactNode } from "react";

export function InputFieldCardWrapper({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="mb-4">
      <div className="rounded-md bg-bg-secondary p-4 md:p-6">{children}</div>
    </div>
  );
}
