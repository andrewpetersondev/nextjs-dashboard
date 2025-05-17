export function RememberMeCheckbox() {
	return (
		<div className="flex gap-3">
			<div className="flex h-6 shrink-0 items-center">
				<div className="group grid size-4 grid-cols-1">
					<input
						id="remember-me"
						name="remember-me"
						type="checkbox"
						className="border-bg-accent bg-bg-accent text-bg-active focus:ring-bg-focus col-start-1 row-start-1 h-4 w-4 rounded"
					/>
					<svg
						fill="none"
						viewBox="0 0 14 14"
						className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 group-has-[:checked]:opacity-100"
					>
						<title>Checkmark</title>
						<path
							d="M3 8L6 11L11 3.5"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			</div>
			<label
				htmlFor="remember-me"
				className="text-text-primary block text-sm/6"
			>
				Remember me
			</label>
		</div>
	)
}
