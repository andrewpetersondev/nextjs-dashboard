"use client";
import { type JSX, useActionState } from "react";
import type { FormState } from "@/src/lib/definitions/form.ts";
import type { EditUserFormFields } from "@/src/lib/definitions/users.ts";
import type { UserDTO } from "@/src/lib/dto/user.dto.ts";
import { editUser } from "@/src/lib/server-actions/users.ts";
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
			title="Edit User"
			description="Admins can edit any profile."
			action={action}
			state={state}
			pending={pending}
			submitLabel="Save Changes"
			cancelHref="/dashboard/users"
			initialValues={{
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
			}}
			isEdit={true}
			showPassword={true}
		/>
	);
}
