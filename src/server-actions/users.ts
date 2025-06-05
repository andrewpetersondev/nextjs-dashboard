"use server";

import { db } from "@/src/db/database";
import { demoUserCounters, users } from "@/src/db/schema";
import { comparePassword, hashPassword } from "@/src/lib/password";
import { createSession, deleteSession } from "@/src/lib/session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import {
	CreateUserFormSchema,
	type CreateUserFormState,
	EditUserFormSchema,
	type EditUserFormState,
	LoginFormSchema,
	type LoginFormState,
	SignupFormSchema,
	type SignupFormState,
	type UserRole,
} from "@/src/lib/definitions/users";
import { revalidatePath } from "next/cache";

// --- Signup ---
export async function signup(
	_prevState: SignupFormState,
	formData: FormData,
): Promise<SignupFormState> {
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
		const hashedPassword = await hashPassword(password);
		const [user] = await db
			.insert(users)
			.values({
				username,
				email,
				password: hashedPassword,
			})
			.returning({ insertedId: users.id });
		const userId = user?.insertedId;
		if (!userId) {
			console.error("Failed to create account");
			return { message: "Failed to create account. Please try again." };
		}
		await createSession(userId, "user");
	} catch (error) {
		console.error("Failed to create user:", error);
		return { message: "An unexpected error occurred. Please try again." };
	}

	redirect("/dashboard");
}

// --- Login ---
export async function login(
	_prevState: LoginFormState,
	formData: FormData,
): Promise<LoginFormState> {
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

		const validPassword = await comparePassword(password, user.password);

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
	redirect("/");
}

// --- Demo User ---
export async function demoUser(
	role: UserRole = "user",
): Promise<{ message?: string; success: boolean }> {
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
	_prevState: CreateUserFormState,
	formData: FormData,
): Promise<CreateUserFormState> {
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
	_prevState: EditUserFormState,
	formData: FormData,
): Promise<EditUserFormState> {
	const validated = EditUserFormSchema.safeParse({
		userId: formData.get("userId"),
		username: formData.get("username"),
		email: formData.get("email"),
		password: formData.get("password"),
		role: formData.get("role"),
	});

	if (!validated.success) {
		return {
			errors: validated.error.flatten().fieldErrors,
			message: "Missing Fields. Failed to Update User.",
		};
	}

	const { username, email, password, role } = validated.data;

	try {
		const updateData: Record<string, unknown> = { username, email, role };
		if (password && password.trim() !== "") {
			updateData.password = await hashPassword(password);
		}
		await db.update(users).set(updateData).where(eq(users.id, id));
	} catch (error) {
		console.error("[editUser] Database Error:", { error, userId: id });
		return { message: "Database Error. Failed to Update User." };
	}

	revalidatePath("/dashboard/users");
	redirect("/dashboard/users");
}
