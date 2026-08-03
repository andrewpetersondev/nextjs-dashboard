"use client";
import type { FC, JSX } from "react";
import { useActionState } from "react";
import type {
	FormResult,
	FormState,
} from "@/shared/forms/core/types/form-result.dto";
import type { ButtonProps } from "@/ui/atoms/button.atom";
import { SubmitButtonMolecule } from "@/ui/molecules/submit-button.molecule";
import { cn } from "@/ui/utils/cn";

interface DemoFormProps {
	action: (
		_prevState: FormState<never>,
		formData: FormData,
	) => Promise<FormResult<never>>;
	className?: string;
	dataCy?: string;
	label: string;
	size?: ButtonProps["size"];
	text: string;
	variant?: ButtonProps["variant"];
}

/**
 * DemoForm component for demo user login buttons.
 * Displays a loading state while the action is pending and error messages on failure.
 */
export const DemoForm: FC<DemoFormProps> = ({
	text,
	label,
	action,
	className,
	dataCy,
	size,
	variant,
}: DemoFormProps): JSX.Element => {
	const [state, boundAction, pending] = useActionState<
		FormState<never>,
		FormData
	>(action, null);

	return (
		<form action={boundAction} aria-label={label}>
			<SubmitButtonMolecule
				className={cn("mt-2", className)}
				data-cy={dataCy ?? `demo-user-button-${label}`}
				fullWidth={true}
				label={text}
				pending={pending}
				size={size}
				variant={variant}
			/>

			{/* Always-mounted live region: announced only if it exists pre-error. */}
			<div role="alert">
				{state && !state.ok && state.error.message && (
					<p className="mt-2 text-sm text-text-error">{state.error.message}</p>
				)}
			</div>
		</form>
	);
};
