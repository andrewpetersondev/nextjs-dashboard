"use server";

import { redirect } from "next/navigation";
import { GUEST_ROLE, type UserRole } from "@/features/auth/lib/auth.roles";
import type { UserDto } from "@/features/users/lib/dto";
import { USER_ERROR_MESSAGES } from "@/features/users/lib/messages";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { establishSessionAction } from "@/server/auth/actions/establish-session.action";
import { getAppDb } from "@/server/db/db.connection";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { serverLogger } from "@/server/logging/serverLogger";
import { createDemoUser } from "@/server/users/dal/create-demo-user";
import { demoUserCounter } from "@/server/users/dal/demo-user-counter";
import { toUserId } from "@/shared/domain/id-converters";
import type { LegacyFormState } from "@/shared/forms/types/legacy-form.types";
import { ROUTES } from "@/shared/routes/routes";

/**
 * Creates a demo user and logs them in.
 */
export async function demoUserAction(
  role: UserRole = GUEST_ROLE,
): Promise<LegacyFormState<"_root">> {
  let demoUserObject: UserDto | null = null;

  const _result: LegacyFormState<"_root"> = {
    errors: { _root: [USER_ERROR_MESSAGES.UNEXPECTED] },
    message: USER_ERROR_MESSAGES.UNEXPECTED,
    success: false,
  };

  try {
    const db = getAppDb();
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

    const session = await establishSessionAction({
      id: toUserId(demoUserObject.id),
      role: toUserRole(role),
    });
    if (!session.ok) {
      serverLogger.error(
        { context: "demoUserObject", message: "Failed to establish session" },
        "Demo user session establishment failed",
      );
      throw new DatabaseError(USER_ERROR_MESSAGES.UNEXPECTED);
    }
  } catch (e) {
    console.log("error", e);
    throw new Error("something");
  }
  redirect(ROUTES.DASHBOARD.ROOT);
}
