"use client";
import type { UserDTO } from "@/src/dto/user.dto";
import type { FormState } from "@/src/lib/definitions/form";
import type { EditUserFormFields } from "@/src/lib/definitions/users";
import { editUser } from "@/src/server-actions/users";
import { Button } from "@/src/ui/button";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { type JSX, useActionState } from "react";

export default function EditUserForm({ user }: { user: UserDTO }): JSX.Element {
	const initialState: FormState<EditUserFormFields> = {
		message: "",
		errors: {},
	};

	const updateUserWithId: (
		prevState: FormState<EditUserFormFields>,
		formData: FormData,
	) => Promise<FormState<EditUserFormFields>> = editUser.bind(null, user.id);

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

			<form action={action}>
				{/* hidden id for user */}
				<input type="hidden" name="id" value={user.id} />

				{/* username */}
				<div className="mb-4">
					<div className="bg-bg-secondary rounded-md p-4 md:p-6">
						<label
							htmlFor="username"
							className="mb-2 block text-sm font-medium"
						>
							Username: {user.username}
						</label>
						<div className="relative mt-2 rounded-md">
							<div className="relative">
								<input
									id="username"
									name="username"
									type="text"
									defaultValue={user.username}
									className="peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
									placeholder="Enter username..."
									aria-describedby="update-user-username-error"
								/>
								<UserCircleIcon
									className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2"
									aria-hidden="true"
								/>
							</div>
						</div>
						<div
							id="update-user-username-error"
							aria-live="polite"
							aria-atomic="true"
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
						<label htmlFor="email" className="mb-2 block text-sm font-medium">
							Email: {user.email}
						</label>
						<div className="relative mt-2 rounded-md">
							<div className="relative">
								<input
									id="email"
									name="email"
									type="email"
									defaultValue={user.email}
									className="peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
									placeholder="Enter email..."
									aria-describedby="update-user-email-error"
								/>
								<UserCircleIcon
									className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2"
									aria-hidden="true"
								/>
							</div>
						</div>
						<div
							id="update-user-email-error"
							aria-live="polite"
							aria-atomic="true"
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
							htmlFor="password"
							className="mb-2 block text-sm font-medium"
						>
							Password:
						</label>
						<div className="relative mt-2 rounded-md">
							<div className="relative">
								<input
									id="password"
									name="password"
									type="password"
									className="peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
									placeholder="Enter password..."
									aria-describedby="update-user-password-error"
								/>
								<UserCircleIcon
									className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2"
									aria-hidden="true"
								/>
							</div>
						</div>
						<div
							id="update-user-password-error"
							aria-live="polite"
							aria-atomic="true"
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
					<label htmlFor="role" className="mb-2 block text-sm font-medium">
						Choose Role
					</label>
					<div className="relative">
						<select
							id="role"
							name="role"
							className="peer border-bg-accent placeholder:text-text-secondary block w-full cursor-pointer rounded-md border py-2 pl-10 text-sm outline-2"
							defaultValue={user.role}
						>
							<option value="admin">Admin</option>
							<option value="user">User</option>
						</select>
						<UserCircleIcon
							className="text-text-primary pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2"
							aria-hidden="true"
						/>
					</div>
					<div
						id="update-user-role-error"
						aria-live="polite"
						aria-atomic="true"
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
				<div className="mt-6 flex justify-end gap-4">
					<Link
						href="/dashboard/users"
						className="bg-bg-accent text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors"
					>
						Cancel
					</Link>
					<Button
						className="bg-bg-active hover:bg-bg-hover text-text-primary rounded-lg px-4 font-medium transition-colors"
						type="submit"
						disabled={isPending}
					>
						Edit User
					</Button>
				</div>
			</form>
		</div>
	);
}
