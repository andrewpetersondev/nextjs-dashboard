"use client";

import {
	AtSymbolIcon,
	LockClosedIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { type JSX, useActionState, useEffect, useState } from "react";
import { createUser } from "@/src/lib/server-actions/users";
import { InputField } from "@/src/ui/auth/input-field";
import { CreateUserSubmitButton } from "@/src/ui/users/create-user-submit-button";

type CreateUserFormState = Readonly<{
	errors?: {
		username?: string[];
		email?: string[];
		role?: string[];
		password?: string[];
	};
	message?: string;
	success?: boolean;
}>;

export default function CreateUserForm(): JSX.Element {
	const [state, action, pending] = useActionState<
		CreateUserFormState,
		FormData
	>(createUser, { errors: {}, message: "", success: undefined });

	const [showAlert, setShowAlert] = useState(false);

	useEffect(() => {
		if (state.message) {
			setShowAlert(true);
			const timer = setTimeout(() => setShowAlert(false), 4000); // 4 seconds
			return () => clearTimeout(timer);
		}
		setShowAlert(false);
	}, [state.message]);

	return (
		<div>
			<form action={action} autoComplete="off" className="space-y-6">
				<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-1">
					<InputField
						autoComplete="username"
						dataCy="signup-username-input"
						error={state?.errors?.username}
						icon={
							<UserIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
						}
						id="username"
						label="Username"
						name="username"
						required={true}
						type="text"
					/>
					<InputField
						autoComplete="email"
						dataCy="signup-email-input"
						error={state?.errors?.email}
						icon={
							<AtSymbolIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
						}
						id="email"
						label="Email address"
						name="email"
						placeholder="steve@jobs.com"
						required={true}
						type="email"
					/>
					<InputField
						autoComplete="new-password"
						dataCy="signup-password-input"
						describedById="signup-password-errors"
						error={state?.errors?.password}
						icon={
							<LockClosedIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
						}
						id="password"
						label="Password"
						name="password"
						placeholder="Enter your password"
						required={true}
						type="password"
					/>

					{/* User Role */}
					<div className="mb-4">
						<label className="mb-2 block text-sm font-medium" htmlFor="role">
							Role
						</label>
						<select
							className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring focus:ring-primary"
							id="role"
							name="role"
						>
							<option value="admin">Admin</option>
							<option value="user">User</option>
						</select>
						<div aria-atomic="true" aria-live="polite" id="create-user-error">
							{state.errors?.role?.map((error: string) => (
								<p className="text-text-error mt-2 text-sm" key={error}>
									{error}
								</p>
							))}
						</div>
					</div>
				</div>
				<div className="mt-6 flex justify-end gap-4">
					<Link
						className="bg-bg-accent text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors"
						href="/dashboard/users"
					>
						Cancel
					</Link>
					<CreateUserSubmitButton
						data-cy="create-user-submit-button"
						pending={pending}
					>
						Create User
					</CreateUserSubmitButton>
				</div>
			</form>
			<div>
				<div className="relative min-h-[56px]">
					{state.message && (
						<div
							// Animate in/out with Tailwind transitions
							aria-live={state.success ? "polite" : "assertive"}
							className={`pointer-events-auto absolute left-0 right-0 mx-auto mt-6 w-fit rounded-md border px-4 py-3 shadow-lg transition-all duration-500
              ${
								showAlert
									? "opacity-100 translate-y-0"
									: "opacity-0 -translate-y-4 pointer-events-none"
							}
              ${
								state.success === true
									? "border-green-300 bg-green-50 text-green-800"
									: "border-red-300 bg-red-50 text-red-800"
							}
            `}
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
		</div>
	);
}
