"use client";
import type { UserDTO } from "@/src/dto/user.dto";
import type { FormState } from "@/src/lib/definitions/form";
import type { EditUserFormFields } from "@/src/lib/definitions/users";
import { editUser } from "@/src/server-actions/users";
import { type JSX, useActionState } from "react";

export default function EditUserForm({ user }: { user: UserDTO }): JSX.Element {
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

			<section>
				<p>Admins can edit any profile.</p>
			</section>

			<form className="bg-gray-400" action={action}>
				<input type="hidden" name="userId" value={user.id} />

				<label>
					Username:
					<input type="text" name="username" defaultValue={user.username} />
				</label>

				<div id="update-user-error" aria-live="polite" aria-atomic="true">
					{state.errors?.username?.map((error: string) => (
						<p className="text-text-error mt-2 text-sm" key={error}>
							{error}
						</p>
					))}
				</div>

				<br />

				<label>
					Email:
					<input type="email" name="email" defaultValue={user.email} />
				</label>

				<div id="update-user-error" aria-live="polite" aria-atomic="true">
					{state.errors?.email?.map((error: string) => (
						<p className="text-text-error mt-2 text-sm" key={error}>
							{error}
						</p>
					))}
				</div>

				<br />

				<label>
					Password:
					<input type="password" name="password" />
				</label>

				<div id="update-user-error" aria-live="polite" aria-atomic="true">
					{state.errors?.password?.map((error: string) => (
						<p className="text-text-error mt-2 text-sm" key={error}>
							{error}
						</p>
					))}
				</div>

				<br />

				<label>
					Role:
					<select name="role" defaultValue={user.role}>
						<option value="admin">Admin</option>
						<option value="user">User</option>
					</select>
				</label>

				<div id="update-user-error" aria-live="polite" aria-atomic="true">
					{state.errors?.role?.map((error: string) => (
						<p className="text-text-error mt-2 text-sm" key={error}>
							{error}
						</p>
					))}
				</div>

				<br />

				<button
					type="submit"
					disabled={isPending}
					className="bg-blue-500 text-white p-2 rounded"
				>
					Save Changes
				</button>
			</form>
		</div>
	);
}
