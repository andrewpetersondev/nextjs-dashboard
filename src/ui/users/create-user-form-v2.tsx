"use client";

import { type JSX, useActionState } from "react";
import { createUserAction } from "@/src/lib/server-actions/users.actions";
import { UserForm } from "@/src/ui/users/user-form";

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
	const initialState: CreateUserFormState = {
		errors: {},
		message: "",
		success: undefined,
	};
	const [state, action, pending] = useActionState<
		CreateUserFormState,
		FormData
	>(createUserAction, initialState);

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
