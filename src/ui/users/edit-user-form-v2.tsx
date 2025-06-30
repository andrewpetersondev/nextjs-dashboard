"use client";
import { type JSX, useActionState } from "react";
import type { FormState } from "@/src/lib/definitions/form.ts";
import type { EditUserFormFields } from "@/src/lib/definitions/users.ts";
import type { UserDTO } from "@/src/lib/dto/user.dto.ts";
import { editUser } from "@/src/lib/server-actions/users.ts";
import { UserForm } from "@/src/ui/users/user-form.tsx";

function UserInfoPanel({ user }: { user: UserDTO }) {
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

export function EditUserFormV2({ user }: { user: UserDTO }): JSX.Element {
	const initialState = { errors: {}, message: "", success: undefined };
	const updateUserWithId: (
		prevState: FormState<EditUserFormFields>,
		formData: FormData,
	) => Promise<FormState<EditUserFormFields>> = editUser.bind(null, user.id);

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
