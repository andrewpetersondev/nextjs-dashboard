import type { FC } from "react";

/**
 * Divider for separating form sections.
 */
export const SignupFormDivider: FC = () => (
	<div className="relative my-5">
		<div aria-hidden="true" className="absolute inset-0 flex items-center">
			<div className="border-bg-accent w-full border-t" />
		</div>
		<div className="relative flex justify-center text-sm/6 font-medium">
			<span className="bg-bg-primary text-text-secondary px-6">
				Or sign up with
			</span>
		</div>
	</div>
);
