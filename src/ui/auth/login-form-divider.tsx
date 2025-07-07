import type { FC } from "react";

export const LoginFormDivider: FC = () => (
	<div className="relative mt-10">
		<div aria-hidden="true" className="absolute inset-0 flex items-center">
			<div className="border-bg-accent w-full border-t" />
		</div>
		<div className="relative flex justify-center text-sm/6 font-medium">
			<span className="bg-bg-primary text-text-secondary px-6">
				Or continue with
			</span>
		</div>
	</div>
);
