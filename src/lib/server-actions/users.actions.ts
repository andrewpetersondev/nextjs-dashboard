"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword } from "@/src/lib/auth/password";
import { createSession, deleteSession } from "@/src/lib/auth/session-jwt";
import {
	createDemoUser,
	createUserDal,
	deleteUserDal,
	demoUserCounter,
	fetchUserById,
	findUserForLogin,
	readUserDal,
	updateUserDal,
} from "@/src/lib/dal/users.dal";
import { getDB } from "@/src/lib/db/connection";
import type { FormState } from "@/src/lib/definitions/form";
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
	type UserRole,
} from "@/src/lib/definitions/users.types";
import type { UserDto } from "@/src/lib/dto/user.dto";
import { toUserIdBrand, toUserRoleBrand } from "@/src/lib/mappers/user.mapper";
import { stripProperties } from "@/src/lib/utils/utils";
import {
	actionResult,
	getFormField,
	getValidUserRole,
	logError,
	normalizeFieldErrors,
} from "@/src/lib/utils/utils.server";

/**
 * Server Actions for User Management.
 *
 * Handles business logic and delegates all database operations to the DAL.
 * All user input is validated and sanitized.
 *
 * @module server-actions/users
 */

/**
 * Handles user signup.
 * @param _prevState - Previous form state.
 * @param formData - Form data from the signup form.
 * @returns FormState with result message and errors.
 */
export async function signup(
	_prevState: FormState<SignupFormFields>,
	formData: FormData,
): Promise<FormState<SignupFormFields>> {
	try {
		const validated = SignupFormSchema.safeParse({
			email: getFormField(formData, "email"),
			password: getFormField(formData, "password"),
			username: getFormField(formData, "username"),
		});
		if (!validated.success) {
			return actionResult({
				errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
				message: "Validation failed. Please check your input.",
				success: false,
			});
		}
		// Type assertion required for Zod inference
		const { username, email, password } = validated.data as {
			username: string;
			email: string;
			password: string;
		};
		const db = getDB();
		const user = await createUserDal(db, {
			email,
			password,
			role: toUserRoleBrand("user"), // Use branded role
			username,
		});
		if (!user) {
			return actionResult({
				errors: undefined,
				message: "Failed to create an account. Please try again.",
				success: false,
			});
		}
		await createSession(toUserIdBrand(user.id), toUserRoleBrand("user")); // Use branded id and role
	} catch (error) {
		logError("signup", error, { email: formData.get("email") as string });
		return actionResult({
			errors: undefined,
			message: "An unexpected error occurred. Please try again.",
			success: false,
		});
	}
	// Unreachable: redirect throws in Next.js App Router
	// keep: why does redirect have to be here instead of after the session is created?
	redirect("/dashboard");
}

/**
 * Handles user login.
 * @param _prevState - Previous form state.
 * @param formData - Form data from the login form.
 * @returns FormState with result message and errors.
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
				errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
				message: "Validation failed. Please check your input.",
				success: false,
			});
		}
		const { email, password } = validated.data;
		const db = getDB();
		const user = await findUserForLogin(db, email, password);
		if (!user) {
			return actionResult({
				errors: undefined,
				message: "Invalid email or password.",
				success: false,
			});
		}
		await createSession(toUserIdBrand(user.id), toUserRoleBrand(user.role));
	} catch (error) {
		logError("login", error, { email: formData.get("email") as string });
		return actionResult({
			errors: undefined,
			message: "An unexpected error occurred. Please try again.",
			success: false,
		});
	}
	// keep: why does redirect have to be here instead of after the session is created?
	redirect("/dashboard");
}

/**
 * Logs out the current user and redirects to home.
 */
export async function logout(): Promise<void> {
	await deleteSession();
	redirect("/");
	// Unreachable: redirect throws in Next.js App Router
}

/**
 * Deletes a user by ID, revalidates and redirects.
 * Always brands the userId for strict typing.
 * @param userId - The user's ID (string).
 * @returns ActionResult with result message and errors.
 */
export async function deleteUserAction(userId: string): Promise<ActionResult> {
	try {
		const db = getDB();
		// --- Brand the userId to UserId for type safety ---
		const deletedUser = await deleteUserDal(db, toUserIdBrand(userId));
		if (!deletedUser) {
			return actionResult({
				errors: undefined,
				message: "User not found or could not be deleted.",
				success: false,
			});
		}
		revalidatePath("/dashboard/users");
		redirect("/dashboard/users");
		// Unreachable: redirect throws in Next.js App Router
	} catch (error) {
		logError("deleteUserAction", error, { userId });
		return actionResult({
			errors: undefined,
			message: "An unexpected error occurred. Please try again.",
			success: false,
		});
	}
}

/**
 * Deletes a user by ID from FormData.
 * @param formData - Form data containing userId.
 */
export async function deleteUserFormAction(formData: FormData): Promise<void> {
	"use server";
	const userId = formData.get("userId");
	if (typeof userId !== "string" || !userId) {
		// Invalid userId; nothing to do.
		return;
	}
	await deleteUserAction(userId);
}

/**
 * Creates a demo user and logs them in.
 * @param role - User role (default: "guest").
 * @returns ActionResult with result message and errors.
 */
export async function demoUser(
	role: UserRole = toUserRoleBrand("guest"),
): Promise<ActionResult> {
	let demoUser: UserDto | null = null;
	const db = getDB();

	try {
		const counter: number = await demoUserCounter(db, toUserRoleBrand(role));
		if (!counter) {
			logError("demoUser:counter", new Error("Counter is zero or undefined"), {
				role,
			});
			throw new Error("Counter is zero or undefined");
		}
		demoUser = await createDemoUser(db, counter, toUserRoleBrand(role));
		if (!demoUser) {
			logError("demoUser:create", new Error("Demo user creation failed"), {
				role,
			});
			throw new Error("Demo user creation failed");
		}
		await createSession(toUserIdBrand(demoUser.id), toUserRoleBrand(role));
		// Unreachable: redirect throws in Next.js App Router
		// return actionResult({ message: "Demo user created and logged in.", success: true, errors: undefined });
	} catch (error) {
		logError("demoUser:session", error, { demoUser, role });
		return actionResult({
			errors: undefined,
			message: "An unexpected error occurred. Please try again.",
			success: false,
		});
	}
	redirect("/dashboard");
}

/**
 * Creates a new user (admin only).
 * @param _prevState - Previous form state.
 * @param formData - Form data from the create user form.
 * @returns FormState with result message and errors.
 */
export async function createUserAction(
	_prevState: FormState<CreateUserFormFields>,
	formData: FormData,
): Promise<FormState<CreateUserFormFields>> {
	const db = getDB();

	try {
		const validated = CreateUserFormSchema.safeParse({
			email: getFormField(formData, "email"),
			password: getFormField(formData, "password"),
			role: getValidUserRole(formData.get("role")),
			username: getFormField(formData, "username"),
		});
		if (!validated.success) {
			return actionResult({
				errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
				message: "Validation failed. Please check your input.",
				success: false,
			});
		}
		const { username, email, password, role } = validated.data;
		const user = await createUserDal(db, {
			email,
			password,
			role: toUserRoleBrand(role),
			username,
		});
		if (!user) {
			return actionResult({
				errors: undefined,
				message: "Failed to create an account on Users Page. Please try again.",
				success: false,
			});
		}
		return actionResult({
			errors: undefined,
			message: "User created successfully.",
			success: true,
		});
	} catch (error) {
		logError("createUserAction", error, {
			email: formData.get("email") as string,
		});
		return actionResult({
			errors: undefined,
			message: "An unexpected error occurred. Please try again.",
			success: false,
		});
	}
}

// src/lib/server-actions/users.ts

/**
 * Fetches a user by plain string id for UI consumption.
 * Handles branding and error handling at the server boundary.
 * @param id - User id as string (from route params)
 * @returns UserDto or null
 */
export async function readUserAction(id: string): Promise<UserDto | null> {
	const db = getDB();
	try {
		// Brand the id before passing to DAL
		return await fetchUserById(db, toUserIdBrand(id));
	} catch (error) {
		logError("getUserByIdAction", error, { id });
		return null;
	}
}

/**
 * Edits an existing user.
 * @param id - User ID.
 * @param _prevState - Previous form state.
 * @param formData - Form data from the edit user form.
 * @returns FormState with result message and errors.
 */
export async function updateUserAction(
	id: string,
	_prevState: FormState<EditUserFormFields>,
	formData: FormData,
): Promise<FormState<EditUserFormFields>> {
	const db = getDB();
	try {
		const payload = { ...Object.fromEntries(formData.entries()) };

		const clean = stripProperties(payload);

		const validated = EditUserFormSchema.safeParse(clean);

		if (!validated.success) {
			return actionResult({
				errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
				message: "Validation failed. Please check your input.",
				success: false,
			});
		}

		const existingUser: UserDto | null = await readUserDal(
			db,
			toUserIdBrand(id),
		);

		if (!existingUser) {
			return actionResult({
				errors: undefined,
				message: "User not found.",
				success: false,
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
			patch.role = toUserRoleBrand(validated.data.role);
		}
		if (validated.data.password && validated.data.password.length > 0) {
			patch.password = await hashPassword(validated.data.password);
		}
		if (Object.keys(patch).length === 0) {
			// No changes to update; inform the user.
			return actionResult({
				errors: undefined,
				message: "No changes to update.",
				success: true,
			});
		}
		// Use branded id for update
		const updatedUser: UserDto | null = await updateUserDal(
			db,
			toUserIdBrand(id),
			patch,
		);
		if (!updatedUser) {
			return actionResult({
				errors: undefined,
				message: "Failed to update user. Please try again.",
				success: false,
			});
		}
		revalidatePath("/dashboard/users");
		return actionResult({
			errors: undefined,
			message: "Profile updated!",
			success: true,
		});
	} catch (error) {
		logError("updateUserAction", error, { id });
		return actionResult({
			errors: undefined,
			message: "Failed to update user. Please try again.",
			success: false,
		});
	}
}
