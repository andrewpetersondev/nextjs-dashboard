"use client";

import {
	AtSymbolIcon,
	LockClosedIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { type JSX, useActionState } from "react";
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
}>;

// TODO: return success or failure message
export default function CreateUserForm(): JSX.Element {
	const [state, action, pending] = useActionState<
		CreateUserFormState,
		FormData
	>(createUser, { errors: {}, message: "" });
	return (
		// todo: remove noValidate after development
		<form action={action} autoComplete="off" className="space-y-6" noValidate>
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
	);
}
