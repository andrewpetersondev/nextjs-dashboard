"use client";

import { Button } from "@/src/ui/button";
import Link from "next/link";

export default function CreateUserForm() {
	return (
		<form>
			<div className="bg-bg-accent rounded-md p-4 md:p-6">
				{/* User Name */}
				<div className="mb-4">
					<label htmlFor="name" className="mb-2 block text-sm font-medium">
						Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring focus:ring-primary"
					/>
				</div>
				{/* User Email */}
				<div className="mb-4">
					<label htmlFor="email" className="mb-2 block text-sm font-medium">
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring focus:ring-primary"
					/>
				</div>
				{/* User Role */}
				<div className="mb-4">
					<label htmlFor="role" className="mb-2 block text-sm font-medium">
						Role
					</label>
					<select
						id="role"
						name="role"
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring focus:ring-primary"
					>
						<option value="admin">Admin</option>
						<option value="user">User</option>
					</select>
				</div>
				{/* User Password */}
				<div className="mb-4">
					<label htmlFor="password" className="mb-2 block text-sm font-medium">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring focus:ring-primary"
						placeholder="Enter a secure password"
					/>
				</div>
			</div>
			<div className="mt-6 flex justify-end gap-4">
				<Link
					href="/dashboard/users"
					className="bg-bg-accent text-text-primary hover:bg-bg-hover flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors"
				>
					Cancel
				</Link>
				<Button type="submit">Create User</Button>
			</div>
		</form>
	);
}
