import type { JSX, ReactNode } from "react";
import { ButtonAtom, type ButtonProps } from "@/ui/atoms/button.atom";

// Omit children from ButtonProps since we use 'label' instead
interface SubmitButtonProps extends Omit<ButtonProps, "children"> {
  label: ReactNode;
  pending?: boolean;
}

/**
 * A unified Submit Button that wraps ButtonAtom.
 * Maps `pending` (from useActionState) to `isLoading`.
 * Defaults to type="submit".
 *
 * @example
 * <SubmitButton label="Log In" pending={pending} />
 */
export function SubmitButtonMolecule({
  label,
  pending,
  isLoading,
  loadingText = "Loading...",
  type = "submit",
  ...props
}: SubmitButtonProps): JSX.Element {
  return (
    <ButtonAtom
      isLoading={pending || isLoading}
      loadingText={loadingText}
      type={type}
      {...props}
    >
      {label}
    </ButtonAtom>
  );
}
