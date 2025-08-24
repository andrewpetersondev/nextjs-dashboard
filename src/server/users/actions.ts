"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toUserRole } from "@/features/users/lib/to-user-role";
import {
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
} from "@/features/users/messages";
import {
  CreateUserFormSchema,
  EditUserFormSchema,
} from "@/features/users/schema.client";
import type {
  CreateUserFormFieldNames,
  EditUserFormFieldNames,
} from "@/features/users/types";
import { hashPassword } from "@/server/auth/hashing";
import { getDB } from "@/server/db/connection";
import { logger } from "@/server/logging/logger";
import {
  createUserDal,
  deleteUserDal,
  fetchFilteredUsers,
  fetchUserById,
  fetchUsersPages,
  readUserDal,
  updateUserDal,
} from "@/server/users/dal";
import type { UserDto } from "@/server/users/dto";
import { getValidUserRole } from "@/server/users/utils";
import {
  type ActionResult,
  actionResult,
} from "@/shared/action-result/action-result";
import { toUserId } from "@/shared/brands/domain-brands";
import type { FormState } from "@/shared/forms/types";
import { normalizeFieldErrors } from "@/shared/forms/utils";
import { stripProperties } from "@/shared/utils/general";

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
      email: formData.get("email"),
      password: formData.get("password"),
      role: getValidUserRole(formData.get("role")),
      username: formData.get("username"),
    });
    if (!validated.success) {
      return {
        errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
        message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }
    const { username, email, password, role } = validated.data;
    const user = await createUserDal(db, {
      email,
      password,
      role: toUserRole(role),
      username,
    });
    if (!user) {
      return {
        errors: {}, // todo: the error message should be more specific
        message: USER_ERROR_MESSAGES.CREATE_FAILED,
        success: false,
      };
    }
    return {
      data: user,
      message: USER_SUCCESS_MESSAGES.CREATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "createUserAction",
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });

    return {
      errors: {},
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    };
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
      return {
        errors: normalizeFieldErrors(validated.error.flatten().fieldErrors),
        message: USER_ERROR_MESSAGES.VALIDATION_FAILED,
        success: false,
      };
    }

    const existingUser: UserDto | null = await readUserDal(db, toUserId(id));
    if (!existingUser) {
      return {
        errors: {},
        message: USER_ERROR_MESSAGES.NOT_FOUND,
        success: false,
      };
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

    // If no fields have changed, return early
    if (Object.keys(patch).length === 0) {
      return {
        data: existingUser,
        message: USER_SUCCESS_MESSAGES.NO_CHANGES,
        success: true,
      };
    }

    const updatedUser: UserDto | null = await updateUserDal(
      db,
      toUserId(id),
      patch,
    );

    if (!updatedUser) {
      return {
        errors: {},
        message: USER_ERROR_MESSAGES.UPDATE_FAILED,
        success: false,
      };
    }
    revalidatePath("/dashboard/users");
    return {
      data: updatedUser,
      message: USER_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      success: true,
    };
  } catch (error) {
    logger.error({
      context: "updateUserAction",
      error,
      id,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
    });
    return {
      errors: {}, // TODO: return a more specific error message
      message: USER_ERROR_MESSAGES.UPDATE_FAILED,
      success: false,
    };
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
        errors: { _root: ["User not found or delete failed"] },
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
      errors: { _root: ["User delete unsuccessful"] },
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
