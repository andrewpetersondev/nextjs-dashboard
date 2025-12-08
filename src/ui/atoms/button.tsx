import clsx from "clsx";
import type React from "react";
import type { JSX } from "react";

/**
 * Button component for user interactions.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger"; // Add variants
}

export function Button({
  children,
  className,
  variant = "primary", // Default to primary
  ...rest
}: ButtonProps): JSX.Element {
  const variants = {
    danger: "bg-red-600 text-white hover:bg-red-500",
    outline: "border border-bg-accent text-text-primary hover:bg-bg-accent",
    primary:
      "bg-bg-primary text-text-primary ring-1 ring-bg-accent hover:bg-bg-accent",
    secondary:
      "bg-bg-accent text-text-accent hover:bg-bg-hover hover:text-text-hover",
  };

  return (
    <button
      {...rest}
      className={clsx(
        "flex h-10 items-center justify-center rounded-lg px-4 font-medium text-sm transition-colors focus-visible:outline-none",
        "active:bg-bg-active active:text-text-active",
        "focus-visible:outline focus-visible:outline-bg-focus focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-text-disabled disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:bg-bg-disabled aria-disabled:text-text-disabled aria-disabled:opacity-50",
        variants[variant], // Apply variant styles
        className,
      )}
    >
      {children}
    </button>
  );
}
