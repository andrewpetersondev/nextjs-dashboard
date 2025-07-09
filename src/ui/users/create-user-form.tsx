"use client";

import {
	AtSymbolIcon,
	LockClosedIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import { type JSX, useActionState, useEffect, useState } from "react";
import { createUserAction } from "@/src/lib/actions/users.actions";
import type { CreateUserFormState } from "@/src/lib/definitions/users.types";
import { InputField } from "@/src/ui/auth/input-field";
import { FormActionRow } from "@/src/ui/components/form-action-row";
import { FormSubmitButton } from "@/src/ui/components/form-submit-button";
import { H1 } from "@/src/ui/headings";
import { SelectRole } from "@/src/ui/users/select-role";
import { ServerMessage } from "@/src/ui/users/server-message";

export function CreateUserForm(): JSX.Element {
	const initialState = { errors: {}, message: "", success: undefined };

	const [state, action, pending] = useActionState<
		CreateUserFormState,
		FormData
	>(createUserAction, initialState);

	const [showAlert, setShowAlert] = useState(false);

	// Track the selected role in the local state
	const [selectedRole, setSelectedRole] = useState<string | undefined>();

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
			<H1>Create User Form</H1>

			<section>
				<p>Admins can create users.</p>
			</section>

			<form action={action} autoComplete="off">
				{/* Username Field */}
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

				{/* Email Field */}
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

				{/* Password Field */}
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

				{/* Role Selection */}
				<div className="mb-4">
					<label className="mb-2 block text-sm font-medium" htmlFor="role">
						Role
					</label>
					<SelectRole
						error={state?.errors?.role} // Pass validation errors
						// update the selected role state
						onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
							// Defensive: ensure the value is a string and not empty
							const value = event.target.value as string;
							setSelectedRole(value || undefined);
						}}
						value={selectedRole} // Controlled value
					/>
				</div>

				{/* Form Action Row */}
				<FormActionRow cancelHref="/dashboard/users">
					<FormSubmitButton
						data-cy="create-user-submit-button"
						pending={pending}
					>
						Create User
					</FormSubmitButton>
				</FormActionRow>
			</form>

			{/* Server Message */}
			<ServerMessage showAlert={showAlert} state={state} />
		</div>
	);
}
