"use client";
import type { UserDTO } from "@/src/dto/user.dto";
import type { FormState } from "@/src/lib/definitions/form";
import type { EditUserFormFields } from "@/src/lib/definitions/users";
import { editUser } from "@/src/server-actions/users";
import { useActionState } from "react";

export default function EditUserForm({ user }: { user: UserDTO }) {
	const initialState: FormState<EditUserFormFields> = {
		message: "",
		errors: {},
	};
	const updateUserWithId = editUser.bind(null, user.id);
	const [state, action, isPending] = useActionState(
		updateUserWithId,
		initialState,
	);

	return (
		<div>
			<h1>edit user form </h1>
			<div className="flex gap-8 p-10">
				<p>Username: {user.username}</p>
				<p>Email: {user.email}</p>
				<p>Role: {user.role}</p>
				<p>Password: {user.password}</p>
				<p>Id: {user.id}</p>
			</div>

			<form className="bg-gray-400" action={action}>
				<label>
					Username:
					<input type="text" name="username" defaultValue={user.username} />
				</label>

				<label>
					Email:
					<input type="email" name="email" defaultValue={user.email} />
				</label>
				<label>
					Password:
					<input type="password" name="password" />
				</label>
				<label>
					Role:
					<select name="role" defaultValue={user.role}>
						<option value="admin">Admin</option>
						<option value="user">User</option>
					</select>
				</label>
				<button type="submit" disabled={isPending}>
					Save Changes
				</button>
			</form>
			<div id="update-user-error" aria-live="polite" aria-atomic="true">
				{state.errors?.username?.map((error: string) => (
					<p className="text-text-error mt-2 text-sm" key={error}>
						{error}
					</p>
				))}
				{state.errors?.email?.map((error: string) => (
					<p className="text-text-error mt-2 text-sm" key={error}>
						{error}
					</p>
				))}
				{state.errors?.password?.map((error: string) => (
					<p className="text-text-error mt-2 text-sm" key={error}>
						{error}
					</p>
				))}
				{state.errors?.role?.map((error: string) => (
					<p className="text-text-error mt-2 text-sm" key={error}>
						{error}
					</p>
				))}
			</div>
		</div>
	);
}
