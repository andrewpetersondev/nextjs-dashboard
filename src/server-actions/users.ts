"use server";

/**
 ** // TODO: REMOVE DATABASE FROM SERVER ACTIONS. ALL DATABASE QUERIES SHOULD BE IN DAL.
 ** // KEEP:  Server actions should only handle business logic and call DAL functions.
 */

import {
	createDemoUser,
	createUserInDB,
	deleteUser,
	demoUserCounter,
	findUserForLogin,
} from "@/src/dal/users";
import { db } from "@/src/db/database";
import { users } from "@/src/db/schema";
import type { UserDTO } from "@/src/dto/user.dto";
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
import { hashPassword } from "@/src/lib/password";
import { createSession, deleteSession } from "@/src/lib/session";
import {
	actionResult,
	getFormField,
	getValidUserRole,
	logError,
	normalizeFieldErrors,
} from "@/src/lib/utils.server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Handles user signup.
 */
export async function signup(
	_prevState: FormState<SignupFormFields>,
	formData: FormData,
): Promise<FormState<SignupFormFields>> {
	try {
		const validated = SignupFormSchema.safeParse({
			username: getFormField(formData, "username"),
			email: getFormField(formData, "email"),
			password: getFormField(formData, "password"),
		});
		if (!validated.success) {
			return actionResult({
				message: "Validation failed. Please check your input.",
				success: false,
				errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
			});
		}
		// keep: I have no idea why setting the type here is necessary, but do not remove it.
		const { username, email, password } = validated.data as {
			username: string;
			email: string;
			password: string;
		};
		const user = await createUserInDB({
			username,
			email,
			password,
			role: "user",
		});
		if (!user) {
			return actionResult({
				message: "Failed to create an account. Please try again.",
				success: false,
				errors: undefined,
			});
		}
		await createSession(user.id, "user");
	} catch (error) {
		logError("signup", error, { email: formData.get("email") as string });
		return actionResult({
			message: "An unexpected error occurred. Please try again.",
			success: false,
			errors: undefined,
		});
	}
	// keep: why does redirect have to be here instead of after the session is created?
	redirect("/dashboard");
}

/**
 * Handles user login.
 * Validates the form data, checks credentials, and creates a session.
 */
export async function login(
	_prevState: FormState<LoginFormFields>,
	formData: FormData,
): Promise<FormState<LoginFormFields>> {
	try {
		const validated = LoginFormSchema.safeParse({
			email: getFormField(formData, "email"),
			password: getFormField(formData, "password"),
		});
		if (!validated.success) {
			return actionResult({
				message: "Validation failed. Please check your input.",
				success: false,
				errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
			});
		}
		const { email, password } = validated.data;
		const user = await findUserForLogin(email, password);
		if (!user) {
			return actionResult({
				message: "Invalid email or password.",
				success: false,
				errors: undefined,
			});
		}
		await createSession(user.id, user.role as UserRole);
		// is this unreachable anymore? i think not.
		// Unreachable: return actionResult({ message: "Redirecting...", success: true });
	} catch (error) {
		logError("login", error, { email: formData.get("email") as string });
		return actionResult({
			message: "An unexpected error occurred. Please try again.",
			success: false,
			errors: undefined,
		});
	}
	// keep: why does redirect have to be here instead of after the session is created?
	redirect("/dashboard");
}

/**
 * Logs out the current user by deleting a cookie then  redirects to home.
 */
export async function logout(): Promise<void> {
	await deleteSession();
	redirect("/");
	// Unreachable: redirect throws in Next.js App Router
}

/**
 * Deletes a user by ID, revalidates and redirects.
 * This action is intended for use on the Users Page.
 */
export async function deleteUserSA(userId: string): Promise<ActionResult> {
	try {
		const deletedUser = await deleteUser(userId);
		if (!deletedUser) {
			return actionResult({
				message: "User not found or could not be deleted.",
				success: false,
				errors: undefined,
			});
		}
		revalidatePath("/dashboard/users");
		redirect("/dashboard/users");
		// Unreachable: redirect() throws a special error in Next.js App Router
		// Unreachable: return actionResult({ message: "User deleted successfully.", success: true });
	} catch (error) {
		logError("deleteUserServerAction", error, { userId });
		return actionResult({
			message: "An unexpected error occurred. Please try again.",
			success: false,
			errors: undefined,
		});
	}
}

/**
 * Server action to delete a user by ID from FormData.
 * Use as a form action in a Server Component.
 */
export async function deleteUserFormAction(formData: FormData): Promise<void> {
	"use server";
	const userId = formData.get("userId");
	if (typeof userId !== "string" || !userId) {
		// Optionally, handle error or log
		return;
	}
	await deleteUserSA(userId);
}

// TODO: AFTER REFACTORING, I HAVE TO DOUBLE CLICK THE DEMO USER BUTTON BEFORE I AM REDIRECTED TO DASHBOARD PAGE.
/**
 * Creates a demo user and logs them in.
 * The role can be specified, defaulting to "guest".
 */
export async function demoUser(role: UserRole = "guest") {
	try {
		const counter: number = await demoUserCounter(role);
		if (!counter) {
			// return actionResult({
			// 	message: "Failed to read demo user counter. Please try again.",
			// 	success: false,
			// 	errors: undefined,
			// });
			logError("demoUser:counter", new Error("Counter is zero or undefined"), {
				role,
			});
			throw new Error("Counter is zero or undefined");
		}
		const demoUser: UserDTO | null = await createDemoUser(counter, role);
		if (!demoUser) {
			// return actionResult({
			// 	message: "Failed to create demo user. Please try again.",
			// 	success: false,
			// 	errors: undefined,
			// });
			logError("demoUser:create", new Error("Demo user creation failed"), {
				role,
			});
			throw new Error("Demo user creation failed");
		}
		await createSession(demoUser.id, role);
		// return actionResult({
		// 	message: "Demo user created and logged in.",
		// 	success: true,
		// 	errors: undefined,
		// });
	} catch (error) {
		logError("demoUser:session", error, { demoUser, role });
		return actionResult({
			message: "An unexpected error occurred. Please try again.",
			success: false,
			errors: undefined,
		});
		// throw new Error("An unexpected error occurred while creating demo user.");
	}
	redirect("/dashboard");
}

/**
 * Creates a new user.
 ** need to be an admin on the Users Page to access this action.
 */
export async function createUser(
	_prevState: FormState<CreateUserFormFields>,
	formData: FormData,
): Promise<FormState<CreateUserFormFields>> {
	try {
		const validated = CreateUserFormSchema.safeParse({
			username: getFormField(formData, "username"),
			email: getFormField(formData, "email"),
			password: getFormField(formData, "password"),
			role: getValidUserRole(formData.get("role")),
		});
		if (!validated.success) {
			return actionResult({
				message: "Validation failed. Please check your input.",
				success: false,
				errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
			});
		}
		const { username, email, password, role } = validated.data;
		const user = await createUserInDB({
			username,
			email,
			password,
			role,
		});
		if (!user) {
			return actionResult({
				message: "Failed to create an account on Users Page. Please try again.",
				success: false,
				errors: undefined,
			});
		}
		return actionResult({
			message: "User created successfully.",
			success: true,
			errors: undefined,
		});
	} catch (error) {
		logError("createUser", error, { email: formData.get("email") as string });
		return actionResult({
			message: "An unexpected error occurred. Please try again.",
			success: false,
			errors: undefined,
		});
	}
}

/**
 * Edits an existing user.
 */
export async function editUser(
	id: string,
	_prevState: FormState<EditUserFormFields>,
	formData: FormData,
): Promise<FormState<EditUserFormFields>> {
	try {
		const payload = {
			...Object.fromEntries(formData.entries()),
		};
		if (payload.password === "") {
			// biome-ignore lint/performance/noDelete: <explanation>
			delete payload.password;
		}
		const validated = EditUserFormSchema.safeParse(payload);
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
		await db.update(users).set(patch).where(eq(users.id, id));
		revalidatePath("/dashboard/users");
		return actionResult({
			message: "Profile updated!",
			success: true,
			errors: undefined,
		});
	} catch (error) {
		logError("editUser", error, { id });
		return actionResult({
			message: "Failed to update user. Please try again.",
			success: false,
			errors: undefined,
		});
	}
}
