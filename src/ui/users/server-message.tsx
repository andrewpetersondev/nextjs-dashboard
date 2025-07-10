type ServerMessageProps = {
	state: { message?: string; success?: boolean };
	showAlert: boolean;
};

export function ServerMessage({ state, showAlert }: ServerMessageProps) {
	return (
		<div>
			<div className="relative min-h-[56px]">
				{state.message && (
					<div
						// Animate in/out with Tailwind transitions
						aria-live={state.success ? "polite" : "assertive"}
						className={`pointer-events-auto absolute right-0 left-0 mx-auto mt-6 w-fit rounded-md border px-4 py-3 shadow-lg transition-all duration-500 ${
							showAlert
								? "translate-y-0 opacity-100"
								: "-translate-y-4 pointer-events-none opacity-0"
						} ${
							state.success === true
								? "border-green-300 bg-green-50 text-green-800"
								: "border-red-300 bg-red-50 text-red-800"
						} `}
						data-cy={
							state.success
								? "create-user-success-message"
								: "create-user-error-message"
						}
						role={state.success ? "status" : "alert"}
					>
						{state.message}
					</div>
				)}
			</div>
		</div>
	);
}
