import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { Button } from "@/ui/atoms/button";
import { cn } from "@/ui/utils/cn";

interface AuthSubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  dataCy?: string;
  pending?: boolean;
}

/**
 * Accessible, reusable submit button for authentication forms.
 * Wraps the atomic Button component, adding loading state handling and full-width styling.
 */
export function AuthSubmitButton({
  children,
  dataCy,
  pending = false,
  className,
  disabled,
  ...props
}: AuthSubmitButtonProps): JSX.Element {
  return (
    <Button
      aria-disabled={pending}
      className={cn("w-full", className)}
      data-cy={dataCy}
      disabled={pending || disabled}
      type="submit"
      variant="primary" // Explicitly opt-in to the design system's primary style
      {...props}
    >
      {pending ? "Loading..." : children}
    </Button>
  );
}
