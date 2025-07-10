import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { Button } from "@/ui/button";

export interface AuthSubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  dataCy?: string;
  pending?: boolean;
  className?: string;
}

/**
 * Accessible, reusable submit button for authentication forms.
 * Handles pending state and disables the button when pending.
 *
 * @param children - The content of the button, typically text or an icon.
 * @param dataCy - Optional Cypress test id for end-to-end testing.
 * @param pending - Indicates if the button is in a pending state, disabling it if true.
 * @param className - Additional CSS classes for styling the button.
 * @param props - {@link AuthSubmitButtonProps}
 * @returns The rendered submit button as a JSX element.
 */
export function AuthSubmitButton({
  children,
  dataCy,
  pending = false,
  className = "",
  ...props
}: AuthSubmitButtonProps): JSX.Element {
  return (
    <Button
      aria-disabled={pending}
      className={`flex w-full justify-center rounded-md bg-bg-active px-3 py-1.5 font-semibold text-sm/6 text-text-primary shadow-sm hover:bg-bg-hover focus-visible:outline-2 focus-visible:outline-bg-focus focus-visible:outline-offset-2 ${className}`}
      data-cy={dataCy}
      disabled={pending || props.disabled}
      type="submit"
      {...props}
    >
      {children}
    </Button>
  );
}
