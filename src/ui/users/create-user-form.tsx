"use client";

import {
	AtSymbolIcon,
	LockClosedIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import { type JSX, useActionState, useEffect, useState } from "react";
import { createUserAction } from "@/src/lib/actions/users.actions";
import { InputField } from "@/src/ui/auth/input-field";
import { FormActionRow } from "@/src/ui/components/form-action-row";
import { FormSubmitButton } from "@/src/ui/components/form-submit-button";
import { H1 } from "@/src/ui/headings";
import { ServerMessage } from "@/src/ui/users/server-message";

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

export function CreateUserForm(): JSX.Element {
	const initialState = { errors: {}, message: "", success: undefined };

	const [state, action, pending] = useActionState<
		CreateUserFormState,
		FormData
	>(createUserAction, initialState);

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
			<H1>create user form </H1>

			<section>
				<p>Admins can create users.</p>
			</section>

			<form action={action} autoComplete="off">
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
				<FormActionRow cancelHref="/dashboard/users">
					<FormSubmitButton
						data-cy="create-user-submit-button"
						pending={pending}
					>
						Create User
					</FormSubmitButton>
				</FormActionRow>
			</form>
			<ServerMessage showAlert={showAlert} state={state} />
		</div>
	);
}
