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

// TODO: Rewrite all functions for stateless authentication by creating cookies on the server.
/*
 *  To create a cookie I need users.id, sessions.userId, expiresAt, users.role
 *  users.id is created in database
 *  sessions.userId is created in db, may not be necessary because it gives the same info as users.id
 * expiresAt is created in code and encrypt ()
 * for  now, every user's role is set to "user" by default from the db.
 *  soon I will determine who is an admin based off an enumerated list of email addresses.
 * i do not have access to  users.role in signup () because the only thing that gets returned is users.id, so i will
 * hardcode in the user role to signup()
 * signup () can be part of the DAL because verifySessionOptimistic() is impossible without database sessions
 * */
// TODO: may need to update zod to use .safeParseAsync()
export async function signup(state: SignupFormState, formData: FormData) {
	try {
		const validatedFields = SignupFormSchema.safeParse({
			username: formData.get("username"),
			email: formData.get("email"),
			password: formData.get("password"),
		});
		if (!validatedFields.success) {
			return {
				errors: validatedFields.error.flatten().fieldErrors,
			};
		}
		const { username, email, password } = validatedFields.data;
		const hashedPassword = await hashPassword(password);
		const data = await db
			.insert(users)
			.values({
				username: username,
				email: email,
				password: hashedPassword,
			})
			.returning({ insertedId: users.id });
		const userId = data[0]?.insertedId;
		if (!userId) {
			console.log("Failed to create account");
			return { message: "Failed to create account. Please try again." };
		}
		await createSession(userId, "user");
	} catch (error) {
		console.error("Failed to create user:", error);
		return { message: "An unexpected error occurred. Please try again." };
	}
	return redirect("/dashboard");
}

/**
 * Authenticates a user with the provided email and password.
 *
 * Validates the input using `LoginFormSchema`, checks the user's credentials against the database,
 * and creates a session on successful authentication. Redirects to the dashboard on success.
 *
 * @param state - The current form state (not used, reserved for future extensibility).
 * @param formData - The form data containing `email` and `password` fields.
 * @returns An object with validation errors, a message on failure, or redirects on success.
 *
 * @example
 * const result = await login(state, formData);
 * if (result?.errors) {
 *   // handle validation errors
 * }
 */
export async function login(
	state: LoginFormState,
	formData: FormData,
): Promise<
	| {
			errors: { email?: string[] | undefined; password?: string[] | undefined };
			message?: undefined;
	  }
	| { message: string; errors?: undefined }
> {
	const validatedFields = LoginFormSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
	});
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}
	const { email, password } = validatedFields.data;
	try {
		const user = await db
			.select({
				userId: users.id,
				email: users.email,
				role: users.role,
				password: users.password,
			})
			.from(users)
			.where(eq(users.email, email));
		if (!user.length) {
			return { message: "Invalid email or password." };
		}
		const validPassword = await comparePassword(password, user[0].password);
		if (!validPassword) {
			return { message: "Invalid email or password." };
		}
		await createSession(user[0].userId, user[0].role);
	} catch (error) {
		console.error("Failed to log in user:", error);
		return { message: "An unexpected error occurred. Please try again." };
	}
	redirect("/dashboard");
}

export async function logout() {
	await deleteSession();
	redirect("/");
}

export async function deleteUser(userId: string) {
	try {
		await db.delete(users).where(eq(users.id, userId));
	} catch (error) {
		console.error("Failed to delete user:", error);
		throw new Error("An unexpected error occurred. Please try again.");
	}
	redirect("/");
}

/**
 * Creates a new unique demo user for the given role and logs them in.
 * Uses the auto-incremented id from demoUserCounters for unique email/username.
 * @param role - The role for the demo user ("user", "guest", or "admin").
 */
export async function demoUser(
	role: UserRole = "user",
): Promise<never | { message: string }> {
	// Validate role input
	if (!["user", "guest", "admin"].includes(role)) {
		return { message: "Invalid demo user role." };
	}

	let counterId: number;
	try {
		// Insert a new counter row and get the unique id
		const [counter] = await db
			.insert(demoUserCounters)
			.values({ role, count: 1 })
			.returning({ id: demoUserCounters.id });
		counterId = counter.id;
	} catch (error) {
		console.error("[demoUser] Failed to create demo user counter:", error);
		return { message: "An unexpected error occurred. Please try again." };
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
			return { message: "Failed to create demo user. Please try again." };
		}
	} catch (error) {
		console.error("[demoUser] Failed to create demo user:", error);
		return { message: "An unexpected error occurred. Please try again." };
	}

	try {
		await createSession(demoUserId, role);
	} catch (error) {
		console.error("[demoUser] Failed to create session for demo user:", error);
		return { message: "An unexpected error occurred. Please try again." };
	}

	return redirect("/dashboard");
}

/**
 * Creates a new user from the protected /dashboard/users/create/page.tsx.
 * This function is used to create a user account with the provided form data.
 * @param state - The state of the form, which is not used in this function but can be extended for future use.
 * @param formData - The FormData object containing the user details.
 * @returns A redirect to the users page or an error message if the user creation fails.
 */
export async function createUser(
	state: CreateUserFormState,
	formData: FormData,
) {
	try {
		const validatedFields = CreateUserFormSchema.safeParse({
			username: formData.get("username"),
			email: formData.get("email"),
			password: formData.get("password"),
			role: formData.get("role"),
		});

		if (!validatedFields.success) {
			return { errors: validatedFields.error.flatten().fieldErrors };
		}

		const { username, email, password, role } = validatedFields.data;

		const hashedPassword = await hashPassword(password);
		const data = await db
			.insert(users)
			.values({
				username: username,
				email: email,
				password: hashedPassword,
				role: role,
			})
			.returning({ insertedId: users.id });
		const userId = data[0]?.insertedId;
		if (!userId) {
			console.log("Failed to create an account");
			return {
				message: "Failed to create an account on Users Page. Please try again.",
			};
		}
	} catch (error) {
		console.error("Failed to create user: ", error);
		return { message: "An unexpected error occurred. Please try again." };
	}
	// return redirect(`/dashboard/users?query=${email}`);
	return redirect("/dashboard/users/");
}

export async function editUser(
	id: string,
	prevState: EditUserFormState,
	formData: FormData,
) {
	const validatedFields = EditUserFormSchema.safeParse({
		userId: formData.get("userId"),
		username: formData.get("username"),
		email: formData.get("email"),
		password: formData.get("password"),
		role: formData.get("role"),
	});
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Missing Fields. Failed to Update User.",
		};
	}
	const { username, email, password, role } = validatedFields.data;
	try {
		await db
			.update(users)
			.set({
				username: username,
				email: email,
				password: password,
				role: role,
			})
			.where(eq(users.id, id));
	} catch (error) {
		console.error(error);
		return { message: "Database Error. Failed to Update User." };
	}
	revalidatePath("/dashboard/users");
	redirect("/dashboard/users");
}
