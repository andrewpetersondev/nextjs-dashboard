import type { FC } from "react";
import { demoUser } from "@/src/lib/actions/users.actions";
import type { UserRole } from "@/src/lib/definitions/users.types";
import { Button } from "@/src/ui/button";

/**
 * DemoForm component for logging in as a demo user with a specific role.
 *
 * @param props - Component props.
 * @returns Rendered DemoForm component.
 */
export interface DemoFormProps {
	/** Button label for accessibility and testing */
	label: string;
	/** Button text */
	text: string;
	/** User role for demo login */
	userRole: UserRole;
}

export const DemoForm: FC<DemoFormProps> = ({ text, userRole, label }) => (
	<form
		action={async (): Promise<void> => {
			await demoUser(userRole);
		}}
		aria-label={label}
	>
		<Button
			className="mt-2 bg-bg-primary text-text-primary ring-bg-accent hover:bg-bg-accent focus-visible:ring-bg-focus flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ring-1 focus-visible:ring-2"
			data-cy={`demo-user-button-${label}`}
			type="submit"
		>
			{text}
		</Button>
	</form>
);
