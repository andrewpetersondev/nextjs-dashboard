import { memo } from "react";

export const EmailField = memo(function EmailField({ error }: { error?: string[] }) {
    return (
        <div>
            <label htmlFor="email" className="block text-sm/6 font-medium">
                Email address
            </label>
            <div className="mt-2">
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="steve@jobs.com"
                    autoComplete="email"
                    className="text-text-secondary ring-bg-focus placeholder:text-text-disabled focus:ring-bg-focus block w-full rounded-md px-3 py-1.5 ring-1 ring-inset focus:ring-2 sm:text-sm/6"
                    data-cy="login-email-input"
                    aria-invalid={!!error?.length}
                    aria-describedby={error?.length ? "login-email-errors" : undefined}
                />
            </div>
            {error?.length ? (
                <p id="login-email-errors" data-cy="login-email-errors" className="text-text-error">
                    {error.join(", ")}
                </p>
            ) : null}
        </div>
    );
});
