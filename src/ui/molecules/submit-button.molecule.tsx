import type { JSX } from "react";
import { ButtonAtom, type ButtonProps } from "@/ui/atoms/button.atom";

interface SubmitButtonProps extends ButtonProps {
  pending?: boolean;
}

/**
 * A unified Submit Button that wraps ButtonAtom.
 * Maps `pending` (from useActionState) to `isLoading`.
 * Defaults to type="submit".
 */
export function SubmitButtonMolecule({
  pending,
  isLoading,
  type = "submit",
  ...props
}: SubmitButtonProps): JSX.Element {
  return <ButtonAtom isLoading={pending || isLoading} type={type} {...props} />;
}
