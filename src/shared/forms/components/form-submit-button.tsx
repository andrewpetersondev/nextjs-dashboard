import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { ButtonAtom } from "@/ui/atoms/button.atom";

interface FormSubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  dataCy?: string;
  pending?: boolean;
  className?: string;
}

/**
 * Accessible, reusable submit button for forms.
 * Handles pending state and disables the button when pending.
 *
 * @param children - Button content
 * @param dataCy - Cypress test id
 * @param pending - Whether the button is in a pending state
 * @param className - Additional class names for styling
 * @param props - FormSubmitButtonProps
 * @returns JSX.Element
 */
export function FormSubmitButton({
  children,
  dataCy,
  pending = false,
  className = "",
  ...props
}: FormSubmitButtonProps): JSX.Element {
  return (
    <ButtonAtom
      aria-disabled={pending}
      className={`flex justify-center rounded-md bg-bg-active px-3 py-1.5 font-semibold text-sm/6 text-text-primary shadow-sm hover:bg-bg-hover focus-visible:outline-2 focus-visible:outline-bg-focus focus-visible:outline-offset-2 ${className}`}
      data-cy={dataCy}
      disabled={pending || props.disabled}
      type="submit"
      {...props}
    >
      {children}
    </ButtonAtom>
  );
}
