import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { Button } from "@/src/ui/button";

type AuthSubmitButtonProps = {
	children: ReactNode;
	"data-cy"?: string;
	pending?: boolean;
	className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function CreateUserSubmitButton({
	children,
	"data-cy": dataCy,
	pending,
	className = "",
	...props
}: AuthSubmitButtonProps): JSX.Element {
	return (
		<Button
			aria-disabled={pending}
			className={`bg-bg-active text-text-primary hover:bg-bg-hover focus-visible:outline-bg-focus flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
			data-cy={dataCy}
			type="submit"
			{...props}
		>
			{children}
		</Button>
	);
}
