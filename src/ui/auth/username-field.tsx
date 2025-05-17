import { memo } from "react";
import { UserIcon } from "@heroicons/react/24/outline";

export const UsernameField = memo(function UsernameField({ error }: { error?: string[]; }) {
	return (
		<>
			<div>
				<label
					htmlFor="username"
					className="text-text-secondary block text-sm/6 font-medium"
				>
					Username
				</label>
				<div className="@container mt-2 flex items-center">
					<input
						id="username"
						name="username"
						type="text"
						required
						autoComplete="username"
						className="bg-bg-accent text-text-primary ring-bg-accent placeholder:text-text-accent focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
						data-cy="signup-username-input"
					/>
					<UserIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
				</div>
			</div>
			{state?.errors?.username && (
				<p className="text-text-error" data-cy="signup-username-errors">
					{state.errors.username}
				</p>
			)}
		</>
	);
});


