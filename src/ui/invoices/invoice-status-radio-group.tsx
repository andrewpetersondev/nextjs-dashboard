import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { InputHTMLAttributes, JSX } from "react";

interface InvoiceStatusRadioGroupProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "type"> {
	value: "pending" | "paid";
	error?: string | string[];
}

export function InvoiceStatusRadioGroup({
	value,
	name = "status",
	disabled,
	error,
	...props
}: InvoiceStatusRadioGroupProps): JSX.Element {
	// Ensure errors is string[] for consistent mapping
	const errors: string[] = [];
	if (error) {
		if (Array.isArray(error)) {
			errors.push(...error);
		} else if (typeof error === "string") {
			errors.push(error);
		}
	}

	const options = [
		{
			icon: <ClockIcon className="h-4 w-4" />,
			label: "Pending",
			value: "pending",
		},
		{
			icon: <CheckIcon className="h-4 w-4" />,
			label: "Paid",
			value: "paid",
		},
	];

	return (
		<fieldset className="mb-4">
			<legend className="mb-2 block text-sm font-medium">
				Set the invoice status
			</legend>
			<div className="rounded-md border border-bg-accent px-[14px] py-3 outline-2 focus:ring-2 focus-within:ring-bg-focus">
				<div className="flex gap-4">
					{options.map((opt) => (
						<div className="flex items-center" key={opt.value}>
							<input
								aria-describedby={errors.length > 0 ? `${name}-error` : undefined}
								aria-invalid={errors.length > 0}
								className="h-4 w-4 cursor-pointer border-bg-primary bg-bg-accent text-text-primary focus:ring-2"
								defaultChecked={value === opt.value}
								disabled={disabled}
								id={opt.value}
								name={name}
								type="radio"
								value={opt.value}
								{...props}
							/>
							<label
								className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-bg-accent px-3 py-1.5 text-xs font-medium text-text-primary"
								htmlFor={opt.value}
							>
								{opt.label} {opt.icon}
							</label>
						</div>
					))}
				</div>
			</div>
			{errors.length > 0 && (
				<div
					aria-atomic="true"
					aria-live="polite"
					className="mt-2 text-sm text-text-error"
					id={`${name}-error`}
				>
					{errors.map((errorMsg) => (
						<div key={errorMsg}>{errorMsg}</div>
					))}
				</div>
			)}
		</fieldset>
	);
}
