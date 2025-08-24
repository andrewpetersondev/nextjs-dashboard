import type { FC, ReactNode } from "react";

interface AuthFormDividerProps {
  /** The label to display in the divider */
  label: ReactNode;
  /** Optional: Additional class names for the wrapper */
  className?: string;
}

/**
 * AuthFormDivider
 * Reusable divider for authentication forms.
 *
 * @param props - AuthFormDividerProps
 * @returns Divider component with customizable label.
 */
export const AuthFormDivider: FC<AuthFormDividerProps> = ({
  label,
  className = "",
}: AuthFormDividerProps) => (
  <div className={`relative my-5 ${className}`}>
    <div aria-hidden="true" className="absolute inset-0 flex items-center">
      <div className="w-full border-bg-accent border-t" />
    </div>
    <div className="relative flex justify-center font-medium text-sm/6">
      <span className="bg-bg-primary px-6 text-text-secondary">{label}</span>
    </div>
  </div>
);
