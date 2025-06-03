"use client";

import { createUser } from "@/src/server-actions/users";
import { InputField } from "@/src/ui/auth/input-field";
import { CreateUserSubmitButton } from "@/src/ui/users/create-user-submit-button";
import {
	AtSymbolIcon,
	LockClosedIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useActionState } from "react";

type CreateUserFormState = Readonly<{
	errors?: {
		username?: string[];
		email?: string[];
		role?: string[];
		password?: string[];
	};
	message?: string;
}>;

export default function CreateUserForm() {
	const [state, action, pending] = useActionState<
		CreateUserFormState,
		FormData
	>(createUser, { errors: undefined, message: undefined });
	return (
		// todo: remove noValidate after development
		<form action={action} className="space-y-6" autoComplete="off" noValidate>
			<div className="bg-bg-primary px-6 py-12 shadow-sm sm:rounded-lg sm:px-1">
				<InputField
					id="username"
					name="username"
					type="text"
					label="Username"
					autoComplete="username"
					required={true}
					icon={
						<UserIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
					}
					error={state?.errors?.username}
					dataCy="signup-username-input"
				/>
				<InputField
					id="email"
					name="email"
					type="email"
					label="Email address"
					autoComplete="email"
					required={true}
					icon={
						<AtSymbolIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
					}
					error={state?.errors?.email}
					dataCy="signup-email-input"
					placeholder="steve@jobs.com"
				/>
				<InputField
					id="password"
					name="password"
					type="password"
					label="Password"
					autoComplete="new-password"
					required={true}
					icon={
						<LockClosedIcon className="text-text-accent pointer-events-none ml-2 h-[18px] w-[18px]" />
					}
					error={state?.errors?.password}
					dataCy="signup-password-input"
					placeholder="Enter your password"
					describedById="signup-password-errors"
				/>

				{/* User Role */}
				<div className="mb-4">
					<label htmlFor="role" className="mb-2 block text-sm font-medium">
						Role
					</label>
					<select
						id="role"
						name="role"
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring focus:ring-primary"
					>
						<option value="admin">Admin</option>
						<option value="user">User</option>
					</select>
					<div id="create-user-error" aria-live="polite" aria-atomic="true">
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
					href="/dashboard/users"
					className="bg-bg-accent text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors"
				>
					Cancel
				</Link>
				<CreateUserSubmitButton
					pending={pending}
					data-cy="create-user-submit-button"
				>
					Create User
				</CreateUserSubmitButton>
			</div>
		</form>
	);
}
