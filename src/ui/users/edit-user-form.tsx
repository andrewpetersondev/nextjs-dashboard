"use client";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { type JSX, useActionState } from "react";
import type { FormState } from "@/src/lib/definitions/form";
import type { EditUserFormFields } from "@/src/lib/definitions/users";
import type { UserDTO } from "@/src/lib/dto/user.dto";
import { editUser } from "@/src/lib/server-actions/users";
import { Button } from "@/src/ui/button";
import { H1 } from "@/src/ui/headings";

export function EditUserForm({ user }: { user: UserDTO }): JSX.Element {
	const initialState: FormState<EditUserFormFields> = {
		errors: {},
		message: "",
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
			<H1>edit user form </H1>

			<section>
				<p>Admins can edit any profile.</p>
			</section>

			<section>
				{state.errors && (
					<p className="text-text-error mt-4 text-sm">
						{Object.values(state.errors).flat().join(" ")}
					</p>
				)}
				{state.message && (
					<p className="text-text-success mt-4 text-sm">{state.message}</p>
				)}
			</section>

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
				<div className="mt-6 flex justify-end gap-4">
					<Link
						className="bg-bg-accent text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors"
						href="/dashboard/users"
					>
						Cancel
					</Link>
					<Button
						className="bg-bg-active hover:bg-bg-hover text-text-primary rounded-lg px-4 font-medium transition-colors"
						disabled={isPending}
						type="submit"
					>
						Edit User
					</Button>
				</div>
			</form>
		</div>
	);
}
