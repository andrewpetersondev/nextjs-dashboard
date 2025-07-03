"use client";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { type JSX, useActionState, useEffect, useState } from "react";
import type { FormState } from "@/src/lib/definitions/form.ts";
import type { EditUserFormFields } from "@/src/lib/definitions/users.types.ts";
import type { UserDto } from "@/src/lib/dto/user.dto.ts";
import { updateUserAction } from "@/src/lib/server-actions/users.actions.ts";
import { FormActionRow } from "@/src/ui/components/form-action-row.tsx";
import { FormSubmitButton } from "@/src/ui/components/form-submit-button.tsx";
import { ServerMessage } from "@/src/ui/users/server-message.tsx";

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

export function EditUserForm({ user }: { user: UserDto }): JSX.Element {
	const initialState = {
		errors: {},
		message: "",
		success: undefined,
	};

	const updateUserWithId: (
		prevState: FormState<EditUserFormFields>,
		formData: FormData,
	) => Promise<FormState<EditUserFormFields>> = updateUserAction.bind(
		null,
		user.id,
	);

	const [state, action, isPending] = useActionState<
		EditUserFormState,
		FormData
	>(updateUserWithId, initialState);

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
			<form action={action}>
				{/* hidden id for user */}
				<input name="id" type="hidden" value={user.id} />

				{/* username */}
				<div className="mb-4">
					<div className="bg-bg-secondary rounded-md p-4 md:p-6">
						<label
							className="mb-2 block text-sm font-medium"
							htmlFor="username"
						>
							Username: {user.username}
						</label>
						<div className="relative mt-2 rounded-md">
							<div className="relative">
								<input
									aria-describedby="update-user-username-error"
									className="peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
									defaultValue={user.username}
									id="username"
									name="username"
									placeholder="Enter username..."
									type="text"
								/>
								<UserCircleIcon
									aria-hidden="true"
									className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2"
								/>
							</div>
						</div>
						<div
							aria-atomic="true"
							aria-live="polite"
							id="update-user-username-error"
						>
							{state.errors?.username?.map(
								(error: string): JSX.Element => (
									<p className="text-text-error mt-2 text-sm" key={error}>
										{error}
									</p>
								),
							)}
						</div>
					</div>
				</div>

				{/* email */}
				<div className="mb-4">
					<div className="bg-bg-secondary rounded-md p-4 md:p-6">
						<label className="mb-2 block text-sm font-medium" htmlFor="email">
							Email: {user.email}
						</label>
						<div className="relative mt-2 rounded-md">
							<div className="relative">
								<input
									aria-describedby="update-user-email-error"
									className="peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
									defaultValue={user.email}
									id="email"
									name="email"
									placeholder="Enter email..."
									type="email"
								/>
								<UserCircleIcon
									aria-hidden="true"
									className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2"
								/>
							</div>
						</div>
						<div
							aria-atomic="true"
							aria-live="polite"
							id="update-user-email-error"
						>
							{state.errors?.email?.map(
								(error: string): JSX.Element => (
									<p className="text-text-error mt-2 text-sm" key={error}>
										{error}
									</p>
								),
							)}
						</div>
					</div>
				</div>

				{/* password */}
				<div className="mb-4">
					<div className="bg-bg-secondary rounded-md p-4 md:p-6">
						<label
							className="mb-2 block text-sm font-medium"
							htmlFor="password"
						>
							Password:
						</label>
						<div className="relative mt-2 rounded-md">
							<div className="relative">
								<input
									aria-describedby="update-user-password-error"
									className="peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
									id="password"
									name="password"
									placeholder="Enter password..."
									type="password"
								/>
								<UserCircleIcon
									aria-hidden="true"
									className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2"
								/>
							</div>
						</div>
						<div
							aria-atomic="true"
							aria-live="polite"
							id="update-user-password-error"
						>
							{state.errors?.password?.map(
								(error: string): JSX.Element => (
									<p className="text-text-error mt-2 text-sm" key={error}>
										{error}
									</p>
								),
							)}
						</div>
					</div>
				</div>

				{/* Role */}
				<div className="mb-4">
					<label className="mb-2 block text-sm font-medium" htmlFor="role">
						Choose Role
					</label>
					<div className="relative">
						<select
							className="peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
							defaultValue={user.role}
							id="role"
							name="role"
						>
							<option value="admin">Admin</option>
							<option value="user">User</option>
						</select>
						<UserCircleIcon
							aria-hidden="true"
							className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2"
						/>
					</div>
					<div
						aria-atomic="true"
						aria-live="polite"
						id="update-user-role-error"
					>
						{state.errors?.role?.map(
							(error: string): JSX.Element => (
								<p className="text-text-error mt-2 text-sm" key={error}>
									{error}
								</p>
							),
						)}
					</div>
				</div>
				<FormActionRow cancelHref="/dashboard/users">
					<FormSubmitButton
						data-cy="edit-user-submit-button"
						pending={isPending}
					>
						Update User
					</FormSubmitButton>
				</FormActionRow>
			</form>
			<ServerMessage showAlert={showAlert} state={state} />
		</div>
	);
}
