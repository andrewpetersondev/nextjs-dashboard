"use server";

import { db } from "@/src/db/database";
import { demoUserCounters, users } from "@/src/db/schema";
import { comparePassword, hashPassword } from "@/src/lib/password";
import { createSession, deleteSession } from "@/src/lib/session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import type { FormState } from "@/src/lib/definitions/form";
import type { UserRole } from "@/src/lib/definitions/roles";
import {
	type ActionResult,
	type CreateUserFormFields,
	CreateUserFormSchema,
	type EditUserFormFields,
	EditUserFormSchema,
	type LoginFormFields,
	LoginFormSchema,
	type SignupFormFields,
	SignupFormSchema,
} from "@/src/lib/definitions/users";
import { revalidatePath } from "next/cache";

// --- Signup ---
export async function signup(
	_prevState: FormState<SignupFormFields>,
	formData: FormData,
): Promise<FormState<SignupFormFields>> {
	const validated = SignupFormSchema.safeParse({
		username: formData.get("username"),
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (!validated.success) {
		return {
			errors: validated.error.flatten().fieldErrors,
			message: "Validation failed. Please check your input.",
		};
	}

	const { username, email, password } = validated.data as {
		username: string;
		email: string;
		password: string;
	};

	try {
		const hashedPassword: string = await hashPassword(password);

		const [user] = await db
			.insert(users)
			.values({
				username,
				email,
				password: hashedPassword,
			})
			.returning({ insertedId: users.id });

		const userId: string = user?.insertedId;

		if (!userId) {
			console.error("Failed to create an account");
			return { message: "Failed to create an account. Please try again." };
		}

		await createSession(userId, "user");
	} catch (error) {
		console.error("Failed to create a user:", error);
		return { message: "An unexpected error occurred. Please try again." };
	}

	redirect("/dashboard");
}

// --- Login ---
export async function login(
	_prevState: FormState<LoginFormFields>,
	formData: FormData,
): Promise<FormState<LoginFormFields>> {
	const validated = LoginFormSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (!validated.success) {
		return {
			errors: validated.error.flatten().fieldErrors,
			message: "Validation failed. Please check your input.",
		};
	}

	const { email, password } = validated.data;

	try {
		const [user] = await db
			.select({
				userId: users.id,
				email: users.email,
				role: users.role,
				password: users.password,
			})
			.from(users)
			.where(eq(users.email, email));

		if (!user) {
			return { message: "Invalid email or password." };
		}

		const validPassword: boolean = await comparePassword(
			password,
			user.password,
		);

		if (!validPassword) {
			return { message: "Invalid email or password." };
		}

		await createSession(user.userId, user.role);
	} catch (error) {
		console.error("Failed to log in user:", error);
		return { message: "An unexpected error occurred. Please try again." };
	}
	redirect("/dashboard");
}

// --- Logout ---
export async function logout(): Promise<void> {
	await deleteSession();
	redirect("/");
}

// --- Delete User ---
export async function deleteUser(userId: string): Promise<void> {
	try {
		await db.delete(users).where(eq(users.id, userId));
	} catch (error) {
		console.error("Failed to delete user:", error);
		throw new Error("An unexpected error occurred. Please try again.");
	}
	revalidatePath("/dashboard/users");
	redirect("/dashboard/users");
}

// --- Demo User ---
export async function demoUser(role: UserRole = "user"): Promise<ActionResult> {
	if (!["user", "guest", "admin"].includes(role)) {
		return { message: "Invalid demo user role.", success: false };
	}

	let counterId: number;
	try {
		const [counter] = await db
			.insert(demoUserCounters)
			.values({ role, count: 1 })
			.returning({ id: demoUserCounters.id });

		counterId = counter.id;
	} catch (error) {
		console.error("[demoUser] Failed to create demo user counter:", {
			error,
			role,
		});
		return {
			message: "An unexpected error occurred. Please try again.",
			success: false,
		};
	}

	const DEMO_PASSWORD = "Password123!";
	const uniqueEmail = `demo+${role}${counterId}@demo.com`;
	const uniqueUsername = `Demo ${role.charAt(0).toUpperCase() + role.slice(1)} ${counterId}`;

	let demoUserId: string;

	try {
		const hashedPassword = await hashPassword(DEMO_PASSWORD);

		const [user] = await db
			.insert(users)
			.values({
				username: uniqueUsername,
				email: uniqueEmail,
				password: hashedPassword,
				role,
			})
			.returning({ id: users.id });

		demoUserId = user.id;

		if (!demoUserId) {
			return {
				message: "Failed to create demo user. Please try again.",
				success: false,
			};
		}
	} catch (error) {
		console.error("[demoUser] Failed to create demo user:", {
			error,
			role,
			email: uniqueEmail,
		});
		return {
			message: "An unexpected error occurred. Please try again.",
			success: false,
		};
	}

	try {
		await createSession(demoUserId, role);
	} catch (error) {
		console.error("[demoUser] Failed to create session for demo user:", {
			error,
			demoUserId,
			role,
		});
		return {
			message: "An unexpected error occurred. Please try again.",
			success: false,
		};
	}

	redirect("/dashboard");
}

// --- Create User (Admin) ---
export async function createUser(
	_prevState: FormState<CreateUserFormFields>,
	formData: FormData,
): Promise<FormState<CreateUserFormFields>> {
	const validated = CreateUserFormSchema.safeParse({
		username: formData.get("username"),
		email: formData.get("email"),
		password: formData.get("password"),
		role: formData.get("role"),
	});

	if (!validated.success) {
		return { errors: validated.error.flatten().fieldErrors };
	}

	const { username, email, password, role } = validated.data;

	try {
		const hashedPassword = await hashPassword(password);

		const [user] = await db
			.insert(users)
			.values({
				username,
				email,
				password: hashedPassword,
				role,
			})
			.returning({ insertedId: users.id });

		const userId: string | undefined = user?.insertedId;

		if (!userId) {
			console.error("Failed to create an account");
			return {
				message: "Failed to create an account on Users Page. Please try again.",
			};
		}

		return { message: "User created successfully." };
	} catch (error) {
		console.error("Failed to create user: ", error);

		return { message: "An unexpected error occurred. Please try again." };
	}
}

// --- Edit User ---
export async function editUser(
	id: string,
	_prevState: FormState<EditUserFormFields>,
	formData: FormData,
): Promise<FormState<EditUserFormFields>> {
	const payload = {
		...Object.fromEntries(formData.entries()),
	};

	if (payload.password === "") {
		// biome-ignore lint/performance/noDelete: <explanation>
		delete payload.password;
	}

	const validated = EditUserFormSchema.safeParse(payload);

	if (!validated.success) {
		return {
			errors: validated.error.flatten().fieldErrors,
			message: "Validation failed. Please check your input.",
		};
	}

	const [existingUser] = await db
		.select()
		.from(users)
		.where(eq(users.id, id))
		.limit(1);

	if (!existingUser) {
		return { message: "User not found." };
	}

	const patch: Record<string, unknown> = {};

	// Only update if different (avoids unnecessary DB writes)
	if (
		validated.data.username &&
		validated.data.username !== existingUser.username
	) {
		patch.username = validated.data.username;
	}

	if (validated.data.email && validated.data.email !== existingUser.email) {
		patch.email = validated.data.email;
	}

	if (validated.data.role && validated.data.role !== existingUser.role) {
		patch.role = validated.data.role;
	}

	if (validated.data.password && validated.data.password.length > 0) {
		patch.password = await hashPassword(validated.data.password);
	}

	// No changes → nothing to do
	if (Object.keys(patch).length === 0) {
		return { message: "No changes to update." };
	}

	try {
		await db.update(users).set(patch).where(eq(users.id, id));
		revalidatePath("/dashboard/users");
		return { message: "Profile updated!" };
	} catch (error) {
		console.error("Edit user failed:", error);
		return { message: "Failed to update user. Please try again." };
	}
}
