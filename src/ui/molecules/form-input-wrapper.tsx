import type { JSX, ReactNode } from "react";

export const FormInputWrapper = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => (
  <div className="mb-4">
    <div className="rounded-md p-4">{children}</div>
  </div>
);
