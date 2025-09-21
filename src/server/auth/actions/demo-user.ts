"use server";
import { redirect } from "next/navigation";
import { GUEST_ROLE, type UserRole } from "@/features/auth/lib/auth.roles";
import type { UserDto } from "@/features/users/lib/dto";
import { USER_ERROR_MESSAGES } from "@/features/users/lib/messages";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import { createDemoUser } from "@/server/users/dal/create-demo-user";
import { demoUserCounter } from "@/server/users/dal/demo-user-counter";
import { toUserId } from "@/shared/domain/id-converters";
import type { FormState } from "@/shared/forms/form-types";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Creates a demo user and logs them in.
 */
export async function demoUser(
  role: UserRole = GUEST_ROLE,
): Promise<FormState<"_root">> {
  let demoUserObject: UserDto | null = null;

  let result: FormState<"_root"> = {
    errors: { _root: [USER_ERROR_MESSAGES.UNEXPECTED] },
    message: USER_ERROR_MESSAGES.UNEXPECTED,
    success: false,
  };

  try {
    const db = getDB();
    const counter: number = await demoUserCounter(db, toUserRole(role));

    if (!counter || counter <= 0) {
      serverLogger.error({
        context: "demoUserObject",
        message: USER_ERROR_MESSAGES.FETCH_COUNT,
        role,
      });
      throw new DatabaseError(USER_ERROR_MESSAGES.FETCH_COUNT);
    }

    demoUserObject = await createDemoUser(db, counter, toUserRole(role));

    if (!demoUserObject) {
      serverLogger.error({
        context: "demoUserObject",
        message: USER_ERROR_MESSAGES.CREATE_FAILED,
        role,
      });
      throw new DatabaseError(USER_ERROR_MESSAGES.CREATE_FAILED);
    }

    await setSessionToken(toUserId(demoUserObject.id), toUserRole(role));
  } catch (error) {
    serverLogger.error({
      context: "demoUserObject",
      demoUserObject,
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      role,
    });

    result = {
      errors: { _root: [USER_ERROR_MESSAGES.UNEXPECTED] },
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    };

    return result;
  }
  redirect(ROUTES.DASHBOARD.ROOT);
}
