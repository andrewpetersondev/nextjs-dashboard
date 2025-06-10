import { Button } from "@/src/ui/button";
import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";

type AuthSubmitButtonProps = {
	children: ReactNode;
	"data-cy"?: string;
	pending?: boolean;
	className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function AuthSubmitButton({
	children,
	"data-cy": dataCy,
	pending,
	className = "",
	...props
}: AuthSubmitButtonProps): JSX.Element {
	return (
		<Button
			type="submit"
			aria-disabled={pending}
			data-cy={dataCy}
			className={`bg-bg-active text-text-primary hover:bg-bg-hover focus-visible:outline-bg-focus flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
			{...props}
		>
			{children}
		</Button>
	);
}
