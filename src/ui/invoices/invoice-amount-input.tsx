import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import type { InputHTMLAttributes, JSX } from "react";

interface InvoiceAmountInputProps
	extends InputHTMLAttributes<HTMLInputElement> {
	dataCy?: string;
	error?: string | string[] | undefined;
	label?: string;
}

export const InvoiceAmountInput = ({
	id = "amount",
	dataCy,
	label = "Choose an amount",
	error,
	...props
}: InvoiceAmountInputProps): JSX.Element => {
	// Ensure errors is string[] for consistent mapping
	const errors: string[] = [];
	if (error) {
		if (Array.isArray(error)) {
			errors.push(...error);
		} else if (typeof error === "string") {
			errors.push(error);
		}
	}

	return (
		<div className="mb-4">
			<label className="block text-sm font-medium" htmlFor={id}>
				{label}
			</label>
			<div className="relative mt-2 rounded-md">
				<input
					aria-describedby={errors.length > 0 ? `${id}-error` : undefined}
					aria-invalid={errors.length > 0}
					className="block w-full rounded-md border-0 px-8 py-2 text-text-primary placeholder:text-text-accent ring-1 ring-inset ring-bg-accent focus:ring-2 focus:ring-bg-focus sm:text-sm outline-2"
					data-cy={dataCy}
					id={id}
					name={id}
					placeholder="Enter USD amount"
					step=".01"
					type="number"
					{...props}
				/>
				<CurrencyDollarIcon className="pointer-events-none absolute left-2 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-primary peer-focus:text-text-focus" />
			</div>
			{errors.length > 0 && (
				<div
					aria-atomic="true"
					aria-live="polite"
					className="mt-2 text-sm text-text-error"
					id={`${id}-error`}
				>
					{errors.map((errorMsg) => (
						<div key={errorMsg}>{errorMsg}</div>
					))}
				</div>
			)}
		</div>
	);
};
