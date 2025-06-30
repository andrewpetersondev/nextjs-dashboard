import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { Button } from "@/src/ui/button.tsx";

export interface UpdateUserSubmitButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	dataCy?: string;
	pending?: boolean;
	className?: string;
}

/**
 * Accessible, reusable submit button for user creation forms.
 * Handles pending state and disables the button when pending.
 *
 * @param children - Button content
 * @param dataCy - Cypress test id
 * @param pending - Whether the button is in a pending state
 * @param className - Additional class names for styling
 * @param props - UpdateUserSubmitButtonProps
 * @returns JSX.Element
 */
export function UpdateUserSubmitButton({
	children,
	dataCy,
	pending = false,
	className = "",
	...props
}: UpdateUserSubmitButtonProps): JSX.Element {
	return (
		<Button
			aria-disabled={pending}
			className={`bg-bg-active text-text-primary hover:bg-bg-hover focus-visible:outline-bg-focus flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
			data-cy={dataCy}
			disabled={pending || props.disabled}
			type="submit"
			{...props}
		>
			{children}
		</Button>
	);
}
