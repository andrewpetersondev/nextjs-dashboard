"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDB } from "@/db/connection";
import {
  deleteSessionToken,
  setSessionToken,
} from "@/features/sessions/session.jwt";
import { hashPassword } from "@/features/sessions/session.utils";
import {
  createDemoUser,
  createUserDal,
  deleteUserDal,
  demoUserCounter,
  fetchFilteredUsers,
  fetchUserById,
  fetchUsersPages,
  findUserForLogin,
  readUserDal,
  updateUserDal,
} from "@/features/users/user.dal";
import type { UserDto } from "@/features/users/user.dto";
import {
  CreateUserFormSchema,
  EditUserFormSchema,
} from "@/features/users/user.schema";
import {
  validateLoginForm,
  validateSignupForm,
} from "@/features/users/user.service";
import type {
  ActionResult,
  CreateUserFormFieldNames,
  EditUserFormFieldNames,
  LoginFormFieldNames,
  LoginFormFields,
  SignupFormFieldNames,
  SignupFormFields,
  UserCreateState,
  UserRole,
} from "@/features/users/user.types";
import { USER_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { toUserId, toUserRole } from "@/lib/definitions/brands";
import type { FormState } from "@/lib/forms/form.types";
import { normalizeFieldErrors } from "@/lib/forms/form-validation";
import { logger } from "@/lib/utils/logger";
import { stripProperties } from "@/lib/utils/utils";
import {
  actionResult,
  getFormField,
  getValidUserRole,
} from "@/lib/utils/utils.server";

// --- CRUD Actions for Users ---

/**
 * Creates a new user (admin only).
 */
export async function createUserAction(
  _prevState: FormState<CreateUserFormFieldNames>,
  formData: FormData,
): Promise<FormState<CreateUserFormFieldNames>> {
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
        message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      });
    }
    const { username, email, password, role } = validated.data;
    const user = await createUserDal(db, {
      email,
      password,
      role: toUserRole(role),
      username,
    });
    if (!user) {
      return actionResult({
        message: USER_ERROR_MESSAGES.CREATE_FAILED,
        success: false,
      });
    }
    return actionResult({
      message: USER_ERROR_MESSAGES.CREATE_SUCCESS,
      success: true,
    });
  } catch (error) {
    logger.error({
      context: "createUserAction",
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });

    return actionResult({
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    });
  }
}

/**
 * Fetches a user by plain string id for UI consumption.
 */
export async function readUserAction(id: string): Promise<UserDto | null> {
  const db = getDB();
  try {
    return await fetchUserById(db, toUserId(id));
  } catch (error) {
    logger.error({
      context: "readUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.READ_FAILED,
    });
    return null;
  }
}

/**
 * Edits an existing user.
 */
export async function updateUserAction(
  id: string,
  _prevState: FormState<EditUserFormFieldNames>,
  formData: FormData,
): Promise<FormState<EditUserFormFieldNames>> {
  const db = getDB();
  try {
    const payload = { ...Object.fromEntries(formData.entries()) };
    const clean = stripProperties(payload);
    const validated = EditUserFormSchema.safeParse(clean);

    if (!validated.success) {
      return actionResult({
        errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
        message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      });
    }

    const existingUser: UserDto | null = await readUserDal(db, toUserId(id));
    if (!existingUser) {
      return actionResult({
        message: USER_ERROR_MESSAGES.NOT_FOUND,
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
      patch.role = toUserRole(validated.data.role);
    }
    if (validated.data.password && validated.data.password.length > 0) {
      patch.password = await hashPassword(validated.data.password);
    }
    if (Object.keys(patch).length === 0) {
      return actionResult({
        message: USER_ERROR_MESSAGES.NO_CHANGES,
        success: true,
      });
    }
    const updatedUser: UserDto | null = await updateUserDal(
      db,
      toUserId(id),
      patch,
    );
    if (!updatedUser) {
      return actionResult({
        message: USER_ERROR_MESSAGES.UPDATE_FAILED,
        success: false,
      });
    }
    revalidatePath("/dashboard/users");
    return actionResult({
      message: USER_ERROR_MESSAGES.UPDATE_SUCCESS,
      success: true,
    });
  } catch (error) {
    logger.error({
      context: "updateUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });
    return actionResult({
      message: USER_ERROR_MESSAGES.UPDATE_FAILED,
      success: false,
    });
  }
}

/**
 * Deletes a user by ID, revalidates and redirects.
 */
export async function deleteUserAction(userId: string): Promise<ActionResult> {
  try {
    const db = getDB();
    const deletedUser = await deleteUserDal(db, toUserId(userId));
    if (!deletedUser) {
      return actionResult({
        message: USER_ERROR_MESSAGES.NOT_FOUND_OR_DELETE_FAILED,
        success: false,
      });
    }
    revalidatePath("/dashboard/users");
    redirect("/dashboard/users");
  } catch (error) {
    logger.error({
      context: "deleteUserAction",
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      userId,
    });
    return actionResult({
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    });
  }
}

/**
 * Deletes a user by ID from FormData.
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

// --- Authentication Actions ---

/**
 * Handles user signup.
 */
export async function signup(
  _prevState: FormState<SignupFormFieldNames>,
  formData: FormData,
): Promise<UserCreateState> {
  const validated = validateSignupForm(formData);

  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  const { username, email, password } = validated.data as SignupFormFields;

  const db = getDB();

  try {
    const user = await createUserDal(db, {
      email,
      password,
      role: toUserRole("user"),
      username,
    });

    if (!user) {
      return actionResult({
        message: USER_ERROR_MESSAGES.CREATE_FAILED,
        success: false,
      });
    }
    await setSessionToken(toUserId(user.id), toUserRole("user"));
  } catch (error) {
    logger.error({
      context: "signup",
      email: formData.get("email") as string,
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });

    return actionResult({
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    });
  }
  redirect("/dashboard");
}

/**
 * Handles user login.
 */
export async function login(
  _prevState: FormState<LoginFormFieldNames>,
  formData: FormData,
): Promise<FormState<LoginFormFieldNames>> {
  const validated = validateLoginForm(formData);

  if (!validated.success || typeof validated.data === "undefined") {
    return validated;
  }

  const { email, password } = validated.data as LoginFormFields;

  const db = getDB();

  try {
    const user = await findUserForLogin(db, email, password);

    if (!user) {
      return actionResult({
        message: USER_ERROR_MESSAGES.INVALID_CREDENTIALS,
        success: false,
      });
    }

    await setSessionToken(toUserId(user.id), toUserRole(user.role));
  } catch (error) {
    logger.error({
      context: "login",
      email: formData.get("email") as string,
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });

    return actionResult({
      message: USER_ERROR_MESSAGES.UNEXPECTED,
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
  await deleteSessionToken();
  redirect("/");
}

/**
 * Creates a demo user and logs them in.
 */
export async function demoUser(
  role: UserRole = toUserRole("guest"),
): Promise<ActionResult> {
  let demoUser: UserDto | null = null;
  const db = getDB();
  try {
    const counter: number = await demoUserCounter(db, toUserRole(role));
    if (!counter) {
      logger.error({
        context: "demoUser",
        message: "Counter is zero or undefined",
        role,
      });

      throw new Error("Counter is zero or undefined");
    }
    demoUser = await createDemoUser(db, counter, toUserRole(role));
    if (!demoUser) {
      logger.error({
        context: "demoUser",
        message: "Demo user creation failed",
        role,
      });
      throw new Error("Demo user creation failed");
    }
    await setSessionToken(toUserId(demoUser.id), toUserRole(role));
  } catch (error) {
    logger.error({
      context: "demoUser",
      demoUser,
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      role,
    });
    return actionResult({
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    });
  }
  redirect("/dashboard");
}

// --- Read Actions for Users ---

/**
 * Server action to fetch the total number of user pages.
 */
export async function readUsersPagesAction(
  query: string = "",
): Promise<number> {
  const db = getDB();
  return fetchUsersPages(db, query);
}

/**
 * Server action to fetch filtered users for the users table.
 */
export async function readFilteredUsersAction(
  query: string = "",
  currentPage: number = 1,
): Promise<UserDto[]> {
  const db = getDB();
  return fetchFilteredUsers(db, query, currentPage);
}
