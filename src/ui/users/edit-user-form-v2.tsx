"use client";

import { type JSX, useActionState } from "react";
import type { FormState } from "@/src/lib/definitions/form.ts";
import type { EditUserFormFields } from "@/src/lib/definitions/users.types.ts";
import type { UserDto } from "@/src/lib/dto/user.dto.ts";
import { updateUserAction } from "@/src/lib/server-actions/users.actions.ts";
import { UserForm } from "@/src/ui/users/user-form.tsx";

type EditUserFormState = Readonly<{
	errors?: {
		username?: string[];
		email?: string[];
		role?: string[];
		password?: string[];
	};
	message?: string;
	success?: boolean;
}>;

function UserInfoPanel({ user }: { user: UserDto }) {
	return (
		<div className="mb-6 rounded-lg border p-4 bg-muted">
			<div className="mb-1 font-semibold text-primary">Current Information</div>
			<ul className="ml-2 text-sm">
				<li>
					<span className="font-medium">Username:</span> {user.username}
				</li>
				<li>
					<span className="font-medium">Email:</span> {user.email}
				</li>
				<li>
					<span className="font-medium">Role:</span> {user.role}
				</li>
				<li>
					<span className="font-medium">User ID:</span> {user.id}
				</li>
			</ul>
		</div>
	);
}

export function EditUserFormV2({ user }: { user: UserDto }): JSX.Element {
	const initialState = { errors: {}, message: "", success: undefined };
	const updateUserWithId: (
		prevState: FormState<EditUserFormFields>,
		formData: FormData,
	) => Promise<FormState<EditUserFormFields>> = updateUserAction.bind(
		null,
		user.id,
	);

	const [state, action, pending] = useActionState<EditUserFormState, FormData>(
		updateUserWithId,
		initialState,
	);

	return (
		<UserForm
			action={action}
			cancelHref="/dashboard/users"
			description="Admins can edit any profile."
			extraContent={<UserInfoPanel user={user} />}
			initialValues={{
				email: user.email,
				id: user.id,
				role: user.role,
				username: user.username,
			}}
			isEdit={true}
			pending={pending}
			showPassword={true}
			state={state}
			submitLabel="Save Changes"
			title="Edit User"
		/>
	);
}
