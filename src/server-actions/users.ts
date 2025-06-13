"use server";

import { db } from "@/src/db/database";
import { demoUserCounters, users } from "@/src/db/schema";
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
import type { SafeParseReturnType } from "@/src/lib/definitions/zod-alias";
import { comparePassword, hashPassword } from "@/src/lib/password";
import { createSession, deleteSession } from "@/src/lib/session";
import { actionResult, normalizeFieldErrors } from "@/src/lib/utils.server";
import { logError } from "@/src/lib/utils.server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- Helper: Create User ---
async function createUserRecord({
	username,
	email,
	password,
	role = "user",
}: {
	username: string;
	email: string;
	password: string;
	role?: UserRole;
}): Promise<{ userId: string | null; error?: string }> {
	try {
		const hashedPassword: string = await hashPassword(password);
		const [user] = await db
			.insert(users)
			.values({ username, email, password: hashedPassword, role })
			.returning({ insertedId: users.id });
		return { userId: user?.insertedId ?? null };
	} catch (error) {
		console.error("createUserRecord error:", error);
		return { userId: null, error: "Failed to create user record." };
	}
}

// --- Helper: Ensures the role is always a valid UserRole ---
// function normalizeRole(role: unknown, fallback: UserRole = "user"): UserRole {
// 	return USER_ROLES.includes(role as UserRole) ? (role as UserRole) : fallback;
// }

// --- Signup ---
export async function signup(
	_prevState: FormState<SignupFormFields>,
	formData: FormData,
): Promise<FormState<SignupFormFields>> {
	try {
		const validated: SafeParseReturnType<SignupFormFields, SignupFormFields> =
			SignupFormSchema.safeParse({
				username: formData.get("username"),
				email: formData.get("email"),
				password: formData.get("password"),
			});

		if (!validated.success) {
			return actionResult({
				message: "Validation failed. Please check your input.",
				success: false,
				errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
			});
		}

		const { username, email, password } = validated.data as {
			username: string;
			email: string;
			password: string;
		};

		const { userId, error } = await createUserRecord({
			username,
			email,
			password,
			role: "user",
		});

		if (!userId) {
			return actionResult({
				message: error ?? "Failed to create an account. Please try again.",
				success: false,
				errors: undefined,
			});
		}

		await createSession(userId, "user");
		redirect("/dashboard");
	} catch (error) {
		// todo: implement proper error handling in other functions
		logError("signup", error, { email: formData.get("email") as string });
		return actionResult({
			message: "An unexpected error occurred. Please try again.",
			success: false,
			errors: undefined,
		});
	}
}

// --- Login ---
export async function login(
	_prevState: FormState<LoginFormFields>,
	formData: FormData,
): Promise<FormState<LoginFormFields>> {
	const validated: SafeParseReturnType<LoginFormFields, LoginFormFields> =
		LoginFormSchema.safeParse({
			email: formData.get("email"),
			password: formData.get("password"),
		});

	if (!validated.success) {
		return actionResult({
			message: "Validation failed. Please check your input.",
			success: false,
			errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
		});
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
			return actionResult({
				message: "Invalid email or password.",
				success: false,
				errors: undefined,
			});
		}

		const validPassword: boolean = await comparePassword(
			password,
			user.password,
		);
		if (!validPassword) {
			return actionResult({
				message: "Invalid email or password.",
				success: false,
				errors: undefined,
			});
		}

		await createSession(user.userId, user.role as UserRole);
		redirect("/dashboard");
	} catch (error) {
		console.error("Failed to log in user:", error);
		return actionResult({
			message: "An unexpected error occurred. Please try again.",
			success: false,
			errors: undefined,
		});
	}
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
export async function demoUser(
	role: UserRole = "guest",
): Promise<ActionResult> {
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
		return actionResult({
			message: "An unexpected error occurred. Please try again.",
			success: false,
			errors: undefined,
		});
	}

	const DEMO_PASSWORD = "Password123!";
	const uniqueEmail = `demo+${role}${counterId}@demo.com`;
	const uniqueUsername = `Demo_${role.toUpperCase()}_${counterId}`;

	const { userId, error } = await createUserRecord({
		username: uniqueUsername,
		email: uniqueEmail,
		password: DEMO_PASSWORD,
		role,
	});

	if (!userId) {
		return actionResult({
			message: error ?? "Failed to create demo user. Please try again.",
			success: false,
			errors: undefined,
		});
	}

	try {
		await createSession(userId, role);
	} catch (error) {
		console.error("[demoUser] Failed to create session for demo user:", {
			error,
			userId,
			role,
		});
		return actionResult({
			message: "An unexpected error occurred. Please try again.",
			success: false,
			errors: undefined,
		});
	}

	return actionResult({
		message: "Demo user created and logged in.",
		success: true,
		errors: undefined,
	});
}

// --- Create User (Admin) ---
export async function createUser(
	_prevState: FormState<CreateUserFormFields>,
	formData: FormData,
): Promise<FormState<CreateUserFormFields>> {
	const validated: SafeParseReturnType<
		CreateUserFormFields,
		CreateUserFormFields
	> = CreateUserFormSchema.safeParse({
		username: formData.get("username"),
		email: formData.get("email"),
		password: formData.get("password"),
		role: formData.get("role"),
	});

	if (!validated.success) {
		return actionResult({
			message: "Validation failed. Please check your input.",
			success: false,
			errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
		});
	}

	const { username, email, password, role } = validated.data;
	const { userId, error } = await createUserRecord({
		username,
		email,
		password,
		role,
	});

	if (!userId) {
		return actionResult({
			message:
				error ?? "Failed to create an account on Users Page. Please try again.",
			success: false,
			errors: undefined,
		});
	}

	return actionResult({
		message: "User created successfully.",
		success: true,
		errors: undefined,
	});
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

	const validated: SafeParseReturnType<
		Partial<CreateUserFormFields>,
		Partial<CreateUserFormFields>
	> = EditUserFormSchema.safeParse(payload);

	if (!validated.success) {
		return actionResult({
			message: "Validation failed. Please check your input.",
			success: false,
			errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
		});
	}

	const [existingUser] = await db
		.select()
		.from(users)
		.where(eq(users.id, id))
		.limit(1);

	if (!existingUser) {
		return actionResult({
			message: "User not found.",
			success: false,
			errors: undefined,
		});
	}

	const patch: Record<string, unknown> = {};

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

	if (Object.keys(patch).length === 0) {
		return actionResult({
			message: "No changes to update.",
			success: true,
			errors: undefined,
		});
	}

	try {
		await db.update(users).set(patch).where(eq(users.id, id));
		revalidatePath("/dashboard/users");
		return actionResult({
			message: "Profile updated!",
			success: true,
			errors: undefined,
		});
	} catch (error) {
		console.error("Edit user failed:", error);
		return actionResult({
			message: "Failed to update user. Please try again.",
			success: false,
			errors: undefined,
		});
	}
}
