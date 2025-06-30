"use client";
import { type JSX, useActionState } from "react";
import { createUser } from "@/src/lib/server-actions/users.ts";
import { UserForm } from "@/src/ui/users/user-form.tsx";

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

export function CreateUserFormV2(): JSX.Element {
	const initialState = { errors: {}, message: "", success: undefined };
	const [state, action, pending] = useActionState<
		CreateUserFormState,
		FormData
	>(createUser, initialState);

	return (
		<UserForm
			action={action}
			cancelHref="/dashboard/users"
			description="Admins can create users."
			isEdit={false}
			pending={pending}
			showPassword={true}
			state={state}
			submitLabel="Create User"
			title="Create User"
		/>
	);
}
